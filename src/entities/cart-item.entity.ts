import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from 'src/entities/products.entity';
import { VariantEntity } from 'src/entities/variants.entity';
import { VariantSizeEntity } from 'src/entities/variant-size.entity';
import { CartEntity } from './carts.entity';

@Entity({ name: 'cart-item' })
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: CartEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @ManyToOne(() => VariantEntity)
  @JoinColumn({ name: 'variantId' })
  variant: VariantEntity;

  @ManyToOne(() => VariantSizeEntity)
  @JoinColumn({ name: 'sizeId' })
  size: VariantSizeEntity;

  @Column({ type: Number })
  quantity: number;
}
