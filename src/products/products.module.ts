import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VercelBlobService } from '../files/vercel-storage.service';

@Module({
  providers: [ProductsService, VercelBlobService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
