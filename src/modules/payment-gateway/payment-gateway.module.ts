import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { VietQRService } from './vietqr/vietQR.service';
import { VietQRController } from './vietqr/vietQR.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([]), ConfigModule.forRoot(), HttpModule],
  controllers: [VietQRController],
  exports: [VietQRService],
  providers: [VietQRService],
})
export class PaymentGatewayModule {}
