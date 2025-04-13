import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { VietQRController } from './vietqr/vietqr.controller';
import { VietQRService } from './vietqr/vietqr.service';
import { BankService } from './bank/bank.service';
import { BankController } from './bank/bank.controller';
import { BankEntity } from 'src/entities/banks.entity';
import { PaginationHeaderHelper } from 'src/utils/pagination/pagination.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankEntity]),
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
  ],
  controllers: [VietQRController, BankController],
  exports: [VietQRService, BankService],
  providers: [VietQRService, BankService, PaginationHeaderHelper],
})
export class PaymentGatewayModule {}
