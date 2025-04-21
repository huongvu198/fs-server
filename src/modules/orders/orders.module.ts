import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from 'src/entities/order-items.entity';
import { OrderEntity } from 'src/entities/orders.entity';
import { VouchersModule } from '../voucher/voucher.module';
import { UsersModule } from '../users/users.module';
import { CartsModule } from '../carts/carts.module';
import { OrderController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { WssModule } from '../wss/wss.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    VouchersModule,
    UsersModule,
    CartsModule,
    PaymentGatewayModule,
    WssModule,
  ],
  controllers: [OrderController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
