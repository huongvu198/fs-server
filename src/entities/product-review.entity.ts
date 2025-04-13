import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItemEntity } from './order-items.entity';
import { UserEntity } from './users.entity';
import { ProductEntity } from './products.entity';

export enum RatingValue {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

@Entity({ name: 'product-reviews' })
export class ProductReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderItemId: string;

  @ManyToOne(() => OrderItemEntity)
  @JoinColumn({ name: 'orderItemId' })
  orderItem: OrderItemEntity;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  productId: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({
    type: 'enum',
    enum: RatingValue,
  })
  rating: RatingValue;

  @Column({ type: 'text' })
  comment: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
