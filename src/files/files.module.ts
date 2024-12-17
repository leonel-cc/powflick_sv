import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import {  VercelBlobService } from './vercel-storage.service';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsService } from '../products/products.service';

@Module({
  imports: [MulterModule.register()],
  controllers: [FilesController],
  providers: [ProductsService, VercelBlobService],
  exports: [VercelBlobService],
})
export class FilesModule {}
