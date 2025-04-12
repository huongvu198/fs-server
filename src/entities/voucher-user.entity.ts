import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { VoucherEntity } from './voucher.entity';
import { UserEntity } from './users.entity';

@Entity()
export class VoucherUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.vouchers)
  user: UserEntity;

  @ManyToOne(() => VoucherEntity, (voucher) => voucher.voucherUsers)
  voucher: VoucherEntity;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
