import { Module } from '@nestjs/common';
import { InfluencerService } from './influencers.service';
import { InfluencerController } from './influencers.controller';

@Module({
  providers: [InfluencerService],
  controllers: [InfluencerController],
})
export class InfluencersModule {}
