import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddressEntity } from 'src/entities/user-address.entity';
import { UserEntity } from 'src/entities/users.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddressEntity)
    private readonly addressRepo: Repository<UserAddressEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(userId: number, dto: CreateAddressDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const address = this.addressRepo.create({ ...dto, user });
    return this.addressRepo.save(address);
  }

  async update(addressId: string, dto: UpdateAddressDto) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId },
    });
    if (!address) throw new NotFoundException('Address not found');

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async delete(addressId: string) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId },
    });
    if (!address) throw new NotFoundException('Address not found');

    return this.addressRepo.softDelete(addressId);
  }

  async getUserAddresses(userId: number) {
    return this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async setDefault(userId: number, addressId: string) {
    await this.addressRepo.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    return this.addressRepo.update({ id: addressId }, { isDefault: true });
  }
}
