import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SegmentsService } from './segments/segments.service';
import { CreateSegmentDto } from './dto/segment.dto';
import { CategoriesService } from './categories/categories.service';
import { CreateCategoryDto } from './dto/category.dto';
import { SubCategoriesService } from './subcategories/subcategories.service';
import { CreateSubCategoryDto } from './dto/subcategory.dto';
import {
  CreateProductDto,
  GetProductDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';
import { Pagination } from 'src/utils/pagination/pagination.decorator';
import {
  ApiPagination,
  IPagination,
} from 'src/utils/pagination/pagination.interface';

@ApiTags('Products')
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(
    private readonly segmentsService: SegmentsService,
    private readonly categoriesService: CategoriesService,
    private readonly subCategoriesService: SubCategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('create-segment')
  @HttpCode(HttpStatus.CREATED)
  async createSegment(@Body() dto: CreateSegmentDto) {
    return await this.segmentsService.create(dto);
  }

  @Post('create-category')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.categoriesService.create(dto);
  }

  @Post('create-subcategory')
  @HttpCode(HttpStatus.CREATED)
  async createSubcategory(@Body() dto: CreateSubCategoryDto) {
    return await this.subCategoriesService.create(dto);
  }

  @Post('create-product')
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }

  @Patch('archive/:id')
  @HttpCode(HttpStatus.OK)
  async archiveProduct(@Param('id') productId: string) {
    return await this.productsService.archive(productId);
  }

  @Patch('update-product/:id')
  @HttpCode(HttpStatus.OK)
  async updateBasicProduct(
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return await this.productsService.update(productId, dto);
  }

  @Get('all')
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async findAllProduct(
    @Query() query: GetProductDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.productsService.findAllProductCms(query, pagination);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findProductByIdCms(@Param('id') productId: string) {
    return await this.productsService.findProductByIdCms(productId);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') productId: string) {
    return await this.productsService.delete(productId);
  }
}
