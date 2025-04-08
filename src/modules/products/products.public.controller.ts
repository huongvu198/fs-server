import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SegmentsService } from './segments/segments.service';
import { ProductsService } from './products.service';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';
import { Pagination } from 'src/utils/pagination/pagination.decorator';

@ApiTags('Products-Public')
@Controller({
  path: 'products-public',
})
export class ProductsPublicController {
  constructor(
    private readonly segmentsService: SegmentsService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('segments')
  async getSegments() {
    return await this.segmentsService.findAllWithRelations();
  }

  @Get('new-arrivals')
  @ApiPagination()
  async getNewArrivals(@Pagination() pagination: IPagination) {
    return await this.productsService.findNewArrivals(pagination);
  }

  @Get('best-sellers')
  @ApiPagination()
  async getBestSellers(@Pagination() pagination: IPagination) {
    return await this.productsService.findBestSellers(pagination);
  }
}
