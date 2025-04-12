import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './users.entity';
import { VoucherUser } from './voucher-user.entity';

@Entity({ name: 'vouchers' })
export class VoucherEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  discount: number;

  @Column({ type: 'timestamp' })
  expriceDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: number;

  @OneToMany(() => VoucherUser, (voucherUser) => voucherUser.voucher)
  voucherUsers?: VoucherUser[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
