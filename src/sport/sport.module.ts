import { Module } from '@nestjs/common';
import { SportService } from './sport.service';
import { SportController } from './sport.controller';

@Module({
  providers: [SportService],
  controllers: [SportController],
  exports: [SportService],
})
export class SportModule {}
