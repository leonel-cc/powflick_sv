import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ProductsService } from './products/products.service';
import { Product, StateProduct } from './products/entity/products.entity';
import { Op } from 'sequelize';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productService: ProductsService,
  ) {}

  @Get()
  async HelloWorld() {
    return this.appService.hello();
  }

  @Get('detail/:id')
  async getDetail(
  @Param('id') productid: string,
  ) {
    const product: Product = await this.productService.oneProduct(productid);

    const sugestedProducts = await this.productService.sugestedProducts({
      where: {
        sports: product.sports,
        status: StateProduct.Active,
        images: {
          [Op.ne]: null, // Filtra los productos donde 'images' no es un string vacío
        },
      },
      limit: 4,
      attributes: ['id', 'title', 'price', 'sports', 'images'],
    });
    
    return this.appService.getDetail(product.sports, product, sugestedProducts);
  }
}
