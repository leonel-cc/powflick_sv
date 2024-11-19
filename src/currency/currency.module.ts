import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  providers: [CurrencyService],
  controllers: [CurrencyController],
  exports: [CurrencyService],
})
export class CurrencyModule {}
