import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcryptjs';
import { UserEntity } from '../../entities/users.entity';
import { UserMapper } from './users.mappers';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleEntity } from '../../entities/roles.entity';
import { StatusEntity } from '../../entities/status.entity';
import { FilterUserDto } from './dto/query-user.dto';
import { IPagination } from '../../utils/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import removeAccents from 'remove-accents';
import { Errors } from '../../errors/errors';
import { replaceQuerySearch } from '../../utils/helpers/common.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(Errors.EMAIL_ALREADY_EXISTS);
    }

    const user = await this.usersRepository.save(
      UserMapper.toPersistence(createUserDto),
    );

    return UserMapper.toDomain(user);
  }

  async findManyWithPagination(
    filterOptions: FilterUserDto,
    pagination: IPagination,
  ): Promise<{ headers: any; items: UserEntity[] }> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (filterOptions?.role) {
      queryBuilder.andWhere('user.roleId = :roleId', {
        roleId: filterOptions.role,
      });
    }

    if (filterOptions?.search) {
      const search = removeAccents(replaceQuerySearch(filterOptions.search));
      queryBuilder.andWhere(
        'LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.fullName) LIKE LOWER(:search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const total = await queryBuilder.getCount();
    queryBuilder.orderBy('user.id', 'ASC');
    queryBuilder.skip(pagination.startIndex).take(pagination.perPage);

    const items = await queryBuilder.getMany();

    const headers = this.paginationHeaderHelper.getHeaders(pagination, total);

    return {
      headers,
      items,
    };
  }

  async findById(id: number) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: number) {
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'status'],
    });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    if (updateUserDto.password && user.password !== updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updateData: any = { ...updateUserDto };

    if (updateUserDto.role) {
      updateData.role = { id: updateUserDto.role } as RoleEntity;
    }
    if (updateUserDto.status) {
      updateData.status = { id: updateUserDto.status } as StatusEntity;
    }
    await this.usersRepository.update(id, updateData);
    return this.findByIdWithRelations(id);
  }

  async remove(id: number) {
    await this.usersRepository.softDelete(id);
  }
}
