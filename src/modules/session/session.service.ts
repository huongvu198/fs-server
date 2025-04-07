import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/entities/sessions.entity';
import { Not, Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  findById(id: number) {
    return this.sessionRepository.find({ where: { id } });
  }

  create(data: CreateSessionDto) {
    const sessionData = {
      hash: data.hash,
      user: { id: data.userId },
    };
    return this.sessionRepository.create(sessionData);
  }

  update(id: number, payload: UpdateSessionDto) {
    return this.sessionRepository.update(id, payload);
  }

  deleteById(id: number) {
    return this.sessionRepository.softDelete({ id });
  }

  deleteByUserId(userId: number) {
    return this.sessionRepository.softDelete({
      user: { id: userId },
    });
  }

  deleteByUserIdWithExclude(userId: number, excludeSessionId: number) {
    return this.sessionRepository.softDelete({
      user: {
        id: Number(userId),
      },
      id: Not(Number(excludeSessionId)),
    });
  }
}
