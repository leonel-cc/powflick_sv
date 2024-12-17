import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Product } from '../products/entity/products.entity';

@Injectable()
export class CurrencyService {
  private lastFetched: Date;

  private cache: any;

  private readonly apiUrl = 'https://open.er-api.com/v6/latest/USD';

  @Cron('0 0 * * *')  // Esta expresión cron significa "a la medianoche todos los días"
  async handleCron() {
    console.log('Ejecutando tarea programada diariamente para obtener cambios de divisas');
    await this.fetchAndCacheExchangeRates();
  }

  async getExchangeRates() {
    if (this.cache && this.lastFetched && new Date().getTime() - this.lastFetched.getTime() < 24 * 60 * 60 * 1000) {
      // Si los datos en caché son válidos por menos de 24 horas, devolverlos
      return this.cache;
    }
    return this.fetchAndCacheExchangeRates();
  }

  private async fetchAndCacheExchangeRates() {
    try {
      const response = await axios.get(this.apiUrl);
      const data = response.data;
      this.cache = {
        base: data.base,
        date: data.date,
        rates: {
          USD: data.rates.USD,
          EUR: data.rates.EUR,
          CAD: data.rates.CAD,
        },
      };
      this.lastFetched = new Date();

      // // Obtener todos los productos de la base de datos
      // const allProducts: Product[] = await Product.findAll();

      // // Iterar sobre cada producto y actualizar el precio en euros y en dólares canadienses
      // for (const product of allProducts) {
      //   // Calcular el precio en euros utilizando la función convertCurrencyByName
      //   const priceInEUR = this.convertCurrencyByName(product.price, 'EUR');
      //   const regularPriceInEUR = this.convertCurrencyByName(product.regular_price, 'EUR');

      //   // Calcular el precio en dólares canadienses utilizando la función convertCurrencyByName
      //   const priceInCAD = this.convertCurrencyByName(product.price, 'CAD');
      //   const regularPriceInCAD = this.convertCurrencyByName(product.regular_price, 'CAD');

      //   // Actualizar los precios en euros y dólares canadienses en el producto
      //   product.EUR = Number(priceInEUR.toFixed(2));
      //   product.regular_EUR = Number(regularPriceInEUR.toFixed(2));
      //   product.CAD = Number(priceInCAD.toFixed(2));
      //   product.regular_CAD = Number(regularPriceInCAD.toFixed(2));

      //   // Guardar el producto actualizado en la base de datos
      //   await product.save();
      // }

      return this.cache;
    } catch (error) {
      console.error('Error al obtener los tipos de cambio:', error);
      throw new Error('Error al obtener los tipos de cambio');
    }
  }

  public convertCurrency(amount: number, rate: number) {
    const result = (amount * rate).toFixed(2);
    return result;
  }

  public convertCurrencyByName(amount: number, currency: string) {
    if (!this.cache || !this.cache.rates || !this.cache.rates[currency]) {
      throw new Error(`La tasa de cambio para ${currency} no está disponible.`);
    }
    const rate = this.cache.rates[currency];
    return this.convertCurrency(amount, rate);
  }
}
