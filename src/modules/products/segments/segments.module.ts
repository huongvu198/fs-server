import { SegmentEntity } from 'src/entities/segments.entity';
import { SegmentsService } from './segments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([SegmentEntity])],
  providers: [SegmentsService],
  exports: [SegmentsService],
})
export class SegmentsModule {}
