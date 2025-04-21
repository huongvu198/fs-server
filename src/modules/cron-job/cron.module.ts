import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronRedlockModule } from './cron-redlock/cron-redlock.module';

@Module({
  imports: [ScheduleModule.forRoot(), CronRedlockModule],
})
export class CronModule {}
