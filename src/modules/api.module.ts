import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { MailModule } from './send-mail/mail.module';
import { SeedModule } from '../database/seeds/seed.module';
import { UsersModule } from './users/users.module';
import { MasterDataModule } from './master-data/master-data.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';
import { HealthModule } from './health/health.module';
import { VouchersModule } from './voucher/voucher.module';

@Module({
  imports: [
    AuthModule,
    SessionModule,
    MailModule,
    SeedModule,
    UsersModule,
    MasterDataModule,
    ProductsModule,
    CartsModule,
    HealthModule,
    VouchersModule,
  ],
})
export class ApiModule {}
