// import { SessionEntity } from 'src/entities/session.entity';
// import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
// import { UserEntity } from 'src/entities/user.entity';
// import { Session } from 'src/modules/session/domain/session';

// export class SessionMapper {
//   static toDomain(raw: SessionEntity): Session {
//     const domainEntity = new Session();
//     domainEntity.id = raw.id;
//     if (raw.user) {
//       domainEntity.user = UserMapper.toDomain(raw.user);
//     }
//     domainEntity.hash = raw.hash;
//     domainEntity.createdAt = raw.createdAt;
//     domainEntity.updatedAt = raw.updatedAt;
//     domainEntity.deletedAt = raw.deletedAt;
//     return domainEntity;
//   }

//   static toPersistence(domainEntity: Session): SessionEntity {
//     const user = new UserEntity();
//     user.id = Number(domainEntity.user.id);

//     const persistenceEntity = new SessionEntity();
//     if (domainEntity.id && typeof domainEntity.id === 'number') {
//       persistenceEntity.id = domainEntity.id;
//     }
//     persistenceEntity.hash = domainEntity.hash;
//     persistenceEntity.user = user;
//     persistenceEntity.createdAt = domainEntity.createdAt;
//     persistenceEntity.updatedAt = domainEntity.updatedAt;
//     persistenceEntity.deletedAt = domainEntity.deletedAt;

//     return persistenceEntity;
//   }
// }
