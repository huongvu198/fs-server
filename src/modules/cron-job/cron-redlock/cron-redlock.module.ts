import { Module } from '@nestjs/common';
import { CronRedlockService } from './cron-redlock.service';
import { RedLockModule } from '../../../utils/red-lock/red-lock.module';

@Module({
  exports: [CronRedlockService],
  imports: [RedLockModule],
  providers: [CronRedlockService],
})
export class CronRedlockModule {}
