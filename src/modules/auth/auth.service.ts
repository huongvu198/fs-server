import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import ms from 'ms';
import crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { Session } from '../session/domain/session';
import {
  AuthProvidersEnum,
  RoleEnum,
  StatusEnum,
  VerifyCodeEnum,
} from '../../utils/enum';
import { User } from '../users/domain/user';
import { config } from '../../config/app.config';
import { UsersService } from '../users/users.service';
import { SessionService } from '../session/session.service';
import { MailService } from '../send-mail/mail.service';
import { generateVerifyAccountInfo } from '../../utils/helpers/common.helper';
import { Errors } from '../../errors/errors';
import { UsersVerifyService } from '../users/users-verify.service';
import { AuthVerifyEmailDto } from './dto/auth-confirm-email.dto';
import dayjs from 'dayjs';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RedisCacheService } from '../../utils/redis-cache/redis-cache.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private sessionService: SessionService,
    private mailService: MailService,
    private userVerifyService: UsersVerifyService,
    private redisCacheService: RedisCacheService,
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new BadRequestException(Errors.USER_NOT_FOUND);
    }

    if (user.provider !== AuthProvidersEnum.EMAIL) {
      throw new NotFoundException(Errors.AUTH_PROVIDER_NOT_FOUND);
    }

    if (user.status.id === StatusEnum.INACTIVE) {
      throw new BadRequestException(Errors.USER_HAS_NOT_VERIFY_EMAIL);
    }

    if (!user.password) {
      throw new BadRequestException(Errors.INCORRECT_USER_INFO);
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException(Errors.INCORRECT_USER_INFO);
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      userId: user.id,
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const user = await this.usersService.create({
      ...dto,
      email: dto.email,
      role: RoleEnum.USER,
      provider: AuthProvidersEnum.EMAIL,
      status: StatusEnum.INACTIVE,
    });

    const verifyAccount = generateVerifyAccountInfo(
      VerifyCodeEnum.CREATE_ACCOUNT,
    );

    await this.userVerifyService.create({
      userId: user.id,
      code: verifyAccount.code,
      codeExpires: verifyAccount.codeExpires,
      type: VerifyCodeEnum.CREATE_ACCOUNT,
    });

    await this.mailService.verifyAccount({
      to: dto.email,
      data: {
        name: user.fullName,
        customer: user.id,
        code: verifyAccount.code,
        codeExpires: verifyAccount.codeExpires,
      },
    });
  }

  async verifyEmail(dto: AuthVerifyEmailDto) {
    const verify = await this.userVerifyService.findVerifyCode(dto);

    if (!verify || !verify.isValid) {
      throw new BadRequestException(Errors.INVALID_VERIFYCATION_CODE);
    }

    const isExpired = dayjs().isAfter(dayjs(verify.codeExpires));
    if (isExpired) {
      throw new BadRequestException(Errors.EXPIRED_VERIFYCATION_CODE);
    }

    await this.usersService.update(Number(dto.id), {
      status: StatusEnum.ACTIVE,
    });

    await this.userVerifyService.updateVerifyCodeToInvalid(
      Number(dto.id),
      dto.type,
    );
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException(Errors.INCORRECT_EMAIL);
    }

    const forgotExpiresIn = config.jwt.forgotExpiresIn;

    const tokenExpires = Date.now() + ms(forgotExpiresIn);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        expiresIn: forgotExpiresIn,
        secret: config.jwt.forgotSecret,
      },
    );

    const redisKey = `resetPassword:${user.id}`;
    await this.redisCacheService.deleteByKey(redisKey);

    await this.redisCacheService.set(redisKey, hash, ms(forgotExpiresIn));

    await this.mailService.forgotPassword({
      data: {
        hash,
        tokenExpires,
      },
      to: email,
    });
  }

  async resetPassword({ hash, password }: ResetPasswordDto) {
    let userId: string;
    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: string;
      }>(hash, {
        secret: config.jwt.forgotSecret,
      });

      userId = jwtData.forgotUserId;
    } catch (error) {
      console.error('error', error);
      throw new BadRequestException(Errors.INVALID_HASH);
    }

    const redisKey = `resetPassword:${userId}`;
    const storedToken = await this.redisCacheService.get(redisKey);
    if (storedToken !== hash) {
      throw new UnprocessableEntityException('Invalid or expired token');
    }

    const user = await this.usersService.findById(Number(userId));

    if (!user) {
      throw new NotFoundException(Errors.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt();

    user.password = await bcrypt.hash(password, salt);

    await this.sessionService.deleteByUserId(user.id);

    await this.usersService.update(user.id, {
      password: user.password,
    });
  }

  async softDelete(userId: number | string): Promise<void> {
    await this.usersService.remove(Number(userId));
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return await this.sessionService.deleteById(Number(data.sessionId));
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = config.jwt.expiresIn;

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          expiresIn: tokenExpiresIn,
          secret: config.jwt.secret,
        },
      ),
      await this.jwtService.signAsync(
        {
          hash: data.hash,
          sessionId: data.sessionId,
        },
        {
          expiresIn: config.jwt.refreshExpiresIn,
          secret: config.jwt.refreshSecret,
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
