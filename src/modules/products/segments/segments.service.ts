import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SegmentEntity } from '../../../entities/segments.entity';
import { Repository } from 'typeorm';
import { CreateSegmentDto } from '../dto/segment.dto';
import { convertToSlug } from '../../../utils/transformers/slug.transformer';
import { removeVietnameseTones } from '../../../utils/transformers/vietnamese.transformer';
import { Errors } from '../../../errors/errors';

@Injectable()
export class SegmentsService {
  constructor(
    @InjectRepository(SegmentEntity)
    private readonly segmentRepository: Repository<SegmentEntity>,
  ) {}

  async findAll() {
    return this.segmentRepository.find();
  }

  async findAllWithRelations() {
    return this.segmentRepository
      .createQueryBuilder('segment')
      .leftJoinAndSelect('segment.categories', 'categories')
      .leftJoinAndSelect('categories.subCategories', 'subCategories')
      .getMany();
  }

  async findById(id: string) {
    return this.segmentRepository.findOne({ where: { id } });
  }

  async create(dto: CreateSegmentDto) {
    const slug = convertToSlug(removeVietnameseTones(dto.name));

    const exitingSegment = await this.segmentRepository.findOne({
      where: { slug },
    });

    if (exitingSegment) {
      throw new BadRequestException(Errors.SEGMENT_EXISTED);
    }

    return this.segmentRepository.save({
      ...dto,
      slug,
    });
  }

  // async update(id: number, segment: Segment): Promise<Segment> {
  //   await this.segmentRepository.update(id, segment);
  //   return this.findOne(id);
  // }
}
