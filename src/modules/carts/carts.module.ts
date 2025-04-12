import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from 'src/entities/cart-item.entity';
import { CartEntity } from 'src/entities/carts.entity';
import { ProductsModule } from '../products/products.module';
import { Module } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartController } from './carts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
    ProductsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartsModule {}
