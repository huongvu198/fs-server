import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SegmentsService } from './segments/segments.service';

@ApiTags('Products-Public')
@Controller({
  path: 'products-public',
})
export class ProductsPublicController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Get('segments')
  async getSegments() {
    return await this.segmentsService.findAllWithRelations();
  }
}
