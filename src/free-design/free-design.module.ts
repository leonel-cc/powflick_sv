import { Module } from '@nestjs/common';
import { FreeDesignService } from './free-design.service';
import { FreeDesignController } from './free-design.controller';

@Module({
  providers: [FreeDesignService],
  controllers: [FreeDesignController],
})
export class FreeDesignModule {}
