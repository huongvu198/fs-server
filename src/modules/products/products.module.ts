import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { VariantEntity } from '../../entities/variants.entity';
import { VariantImageEntity } from '../../entities/variant-image.entity';
import { VariantSizeEntity } from '../../entities/variant-size.entity';
import { ProductEntity } from '../../entities/products.entity';
import { SegmentsModule } from './segments/segments.module';
import { ProductsController } from './products.controller';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoriesModule } from './subcategories/subcategories.module';
import { ProductsPublicController } from './products.public.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      VariantEntity,
      VariantImageEntity,
      VariantSizeEntity,
    ]),
    SegmentsModule,
    CategoriesModule,
    SubCategoriesModule,
  ],
  controllers: [ProductsController, ProductsPublicController],
  providers: [PaginationHeaderHelper, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
