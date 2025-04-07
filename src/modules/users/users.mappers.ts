import { RoleEntity } from 'src/entities/roles.entity';
import { UserEntity } from '../../entities/users.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { CreateUserDto } from './dto/create-user.dto';

export class UserMapper {
  static toDomain(raw: UserEntity) {
    return {
      id: raw.id,
      email: raw.email,
      firstName: raw.firstName,
      lastName: raw.lastName,
      fullName: raw.fullName,
      provider: raw.provider,
      socialId: raw.socialId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      role: raw.role ? { id: raw.role.id, name: raw.role.name } : null,
      status: raw.status ? { id: raw.status.id, name: raw.status.name } : null,
    };
  }

  static toDomainList(rawList: UserEntity[] | null) {
    if (!rawList || rawList.length === 0) return [];
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toPersistence(dto: CreateUserDto): UserEntity {
    const entity = new UserEntity();
    entity.email = dto.email;
    entity.password = dto.password;
    entity.firstName = dto.firstName;
    entity.lastName = dto.lastName;
    entity.provider = dto.provider;
    entity.socialId = dto.socialId;
    entity.fullName = dto.lastName + dto.firstName;
    if (dto.role) {
      entity.role = new RoleEntity();
      entity.role.id = dto.role;
    }

    if (dto.status) {
      entity.status = new StatusEntity();
      entity.status.id = dto.status;
    }

    return entity;
  }
}
