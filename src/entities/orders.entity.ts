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
import { UserAddressEntity } from './user-address.entity';
import { VoucherEntity } from './voucher.entity';
import { OrderItemEntity } from './order-items.entity';
import { TransactionEntity } from './transactions.entity';

export enum OrderStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethodEnum {
  COD = 'cod',
  BANKING = 'banking',
}

export enum PaymentStatusEnum {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  addressId: string;

  @ManyToOne(() => UserAddressEntity)
  @JoinColumn({ name: 'addressId' })
  address: UserAddressEntity;

  @Column({ nullable: true })
  voucherId: string;

  @ManyToOne(() => VoucherEntity, { nullable: true })
  @JoinColumn({ name: 'voucherId' })
  voucher: VoucherEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // Tổng tiền hàng

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number; // Giảm giá từ voucher

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number; // Tổng tiền sau cùng

  @Column({
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  status: OrderStatusEnum;

  @Column({
    type: 'enum',
    enum: PaymentMethodEnum,
    default: PaymentMethodEnum.COD,
  })
  paymentMethod: PaymentMethodEnum;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  paymentStatus: PaymentStatusEnum;

  @Column({ nullable: true })
  note: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order, {
    cascade: true,
  })
  items: OrderItemEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.order)
  transactions: TransactionEntity[];

  @Column({ nullable: true })
  transactionId: string; // Mã giao dịch ngân hàng chính thức (từ transaction)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
