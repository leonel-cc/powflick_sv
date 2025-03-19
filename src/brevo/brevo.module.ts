import { Module } from '@nestjs/common';
import { BrevoService } from './brevo.service';
import { BrevoController } from './brevo.controller';

@Module({
  controllers: [BrevoController],
  providers: [BrevoService],
  exports: [BrevoService],
})
export class BrevoModule {}
