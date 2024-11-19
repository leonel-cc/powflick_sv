import { Controller, Get } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('exchange-rates')
  async getExchangeRates() {
    const rates = await this.currencyService.getExchangeRates();
    return {
      rates,
      attribution: 'Datos de tipos de cambio proporcionados por https://www.exchangerate-api.com',
    };
  }
}
