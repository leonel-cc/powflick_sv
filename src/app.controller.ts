import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ProductsService } from './products/products.service';
import { Product, StateProduct } from './products/entity/products.entity';
import { Op } from 'sequelize';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productService: ProductsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  async HelloWorld() {
    return this.appService.hello();
  }

  @Get('detail/:id')
  async getDetail(@Param('id') productid: string, @Res() res: Response) {
    const cacheKey = `product:${productid}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache-Status', 'HIT'); // Indica que proviene del caché
      return res.status(200).json(cachedData);
    }

    const product: Product = await this.productService.oneProduct(productid);

    const sugestedProducts = await this.productService.sugestedProducts({
      where: {
        sports: product.sports,
        status: StateProduct.Active,
        password: null, // Asegura que no se filtren productos con contraseña
        images: {
          [Op.ne]: null, // Filtra los productos donde 'images' no es un string vacío
        },
      },
      limit: 4,
      attributes: ['id', 'title', 'price', 'sports', 'images', 'slug', 'URL'],
    });

    const sugestedProductIds = sugestedProducts.map((p) => p.id);

    const frequentlyBought = await this.productService.sugestedProducts({
      where: {
        sports: product.sports, // Relacionado con el mismo deporte
        status: StateProduct.Active,
        password: null, // Asegura que no se filtren productos con contraseña
        id: {
          [Op.notIn]: sugestedProductIds, // Excluir productos ya sugeridos
        },
        images: {
          [Op.ne]: null, // Filtra los productos donde 'images' no es un string vacío
        },
      },
      limit: 4,
      attributes: ['id', 'title', 'price', 'sports', 'images', 'slug', 'URL'],
    });

    const result = await this.appService.getDetail(
      product.sports,
      product,
      sugestedProducts,
      frequentlyBought,
    );

    // Almacena en caché el resultado por 5 minutos
    await this.cacheManager.set(cacheKey, result);

    res.setHeader('X-Cache-Status', 'MISS'); // Indica que no estaba en el caché
    return res.status(200).json(result);
  }

  @Get('landing')
  async getLanding(@Res() res: Response) {
    const cacheKey = 'landing';
    const cachedData = await this.cacheManager.get(cacheKey);

    // if (cachedData) {
    //   res.setHeader('X-Cache-Status', 'HIT'); // Indica que proviene del caché
    //   return res.status(200).json(cachedData);
    // }

    const data = await this.appService.getLanding();

    // Almacena en caché el resultado por 5 minutos
    await this.cacheManager.set(cacheKey, data);

    res.setHeader('X-Cache-Status', 'MISS'); // Indica que no estaba en el caché
    return res.status(200).json(data);
  }

  @Get('navbar')
  async getNavbar(@Res() res: Response) {
    const cacheKey = 'navbar';
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache-Status', 'HIT'); // Indica que proviene del caché
      return res.status(200).json(cachedData);
    }

    const data = await this.appService.getNavbar();

    // Almacena en caché el resultado por 5 minutos
    await this.cacheManager.set(cacheKey, data);

    res.setHeader('X-Cache-Status', 'MISS'); // Indica que no estaba en el caché
    return res.status(200).json(data);
  }

  @Get('cacheReset')
  async cacheReset() {
    await this.cacheManager.reset();
    return 'Cache reset succesfully';
  }

  @Get('cacheReset/detail/:slug')
  async cacheResetDetail(@Param('slug') slug: string) {
    await this.cacheManager.del(`product:${slug}`);
    return 'Cache reset detail succesfully';
  }
}
