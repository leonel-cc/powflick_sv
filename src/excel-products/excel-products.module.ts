import { Module } from '@nestjs/common';
import { ExcelProductsController } from './excel-products.controller';
import { ExcelProductsService } from './excel-products.service';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { SportService } from '../sport/sport.service';
import { VercelBlobService } from '../files/vercel-storage.service';
import { CollectionsService } from '../collections/collections.service';
import { TagsService } from '../tags/tags.service';

@Module({
  controllers: [ExcelProductsController],
  providers: [ExcelProductsService, ProductsService, CategoriesService, SportService, VercelBlobService, CollectionsService, TagsService],
  exports: [ExcelProductsService],
})
export class ExcelProductsModule {}
