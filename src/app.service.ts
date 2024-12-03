import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Neck,
  Socks,
  Shorts,
  Pants,
  sportsConfig,
  withOrWithoutShort,
  PaymentMethods,
  ShippingTypes,
  SizeGuide,
  Materials,
  SizeType,
  defaultImage,
} from './utils/detail.enum';
import { Product } from './products/entity/products.entity';
import { Review } from './reviews/entity/reviews.entity';
import { User } from './users/entity/users.entity';
import { Op, Sequelize } from 'sequelize';
import { CategoriesService } from './categories/categories.service';
import { CollectionsService } from './collections/collections.service';

@Injectable()
export class AppService {
  constructor(
    private readonly categoryService: CategoriesService,
    private readonly CollectionsService: CollectionsService,
  ) {}

  hello() {
    return 'hello world';
  }

  async getDetail(
    sport: string,
    product: Product,
    sugestedProducts: Product[],
    frequentlyBought: Product[],
  ) {
    try {
      const { neck, socks, shorts, pants } = sportsConfig[sport];

      const reviews = await Review.findAll({
        where: { productId: product.id, isActive: true },
        include: {
          model: User,
          attributes: ['firstName', 'lastName', 'email'],
        },
        attributes: [
          'id',
          'title',
          'review',
          'type',
          'orderId',
          'productId',
          'rating',
          'image',
          'createdAt',
          'updatedAt',
        ],
      });

      return {
        product,
        sugestedProducts,
        frequentlyBought,
        reviews,
        Default: defaultImage[sport],
        Neck: neck ? Neck : null,
        Socks: socks ? Socks : null,
        Shorts: shorts ? Shorts : !pants && !shorts ? withOrWithoutShort : null,
        Pants: pants ? Pants : null,
        Materials: Materials[sport],
        PaymentMethods,
        ShippingTypes,
        Size: SizeType,
        SizeGuide: SizeGuide[sport],
      };
    } catch (error) {
      throw new HttpException(
        'An error occurred while obtaining the detail validations',
        400,
      );
    }
  }

  async getLanding() {
    try {
      const categories = await this.categoryService.getAll();
      const collectionst =
        await this.CollectionsService.getCollectionNamesWithProducts();
      const recent = await this.getRandomProducts(2);
      const modal = await this.getRandomProducts(5);
      const reviews = await Review.findAll({
        where: { isActive: true },
        include: {
          model: User,
          attributes: ['firstName', 'lastName', 'email'],
        },
        attributes: [
          'id',
          'title',
          'review',
          'type',
          'orderId',
          'productId',
          'rating',
          'image',
          'createdAt',
          'updatedAt',
        ],
      });

      const featuredProducts = await this.getProductsByCondition({
        featured: true,
      });

      const mostSoldProducts = await this.getProductsByCondition({
        mostSold: true,
      });

      const discountProducts = await this.getProductsByCondition({
        discount: { [Op.gt]: 0 },
      });

      // Obtener los últimos productos
      const latestProducts = await this.getLatestProducts(3);
      const bestWeekProducts = await this.getRandomProducts(3);
      const popularProducts = await this.getRandomProducts(3);
      const saleProducts = await this.getRandomProducts(3);

      return {
        navbar: {
          categories,
          recent,
          collectionst,
        },
        landing: {
          reviews,
          modal,
          collections: {
            featuredProducts,
            mostSoldProducts,
            discountProducts,
            latestProducts,
            bestWeekProducts,
            popularProducts,
            saleProducts,
          },
        },
      };
    } catch (error) {
      console.error('Error obtaining landing data:', error);
      throw new HttpException(
        'An error occurred while obtaining the landing data',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getRandomProducts(limit: number) {
    const count = await Product.count();
    if (count < 2) {
      return Product.findAll(); // Si hay menos de 2 productos, devuelve todos
    }

    const randomIndex = Math.floor(Math.random() * Math.max(0, count - 2));

    return Product.findAll({
      offset: randomIndex,
      limit,
      order: Sequelize.literal('RANDOM()'),
    });
  }

  // Método para obtener productos por condición
  private async getProductsByCondition(condition: any) {
    return Product.findAll({
      where: condition,
      // attributes: [
      //   'id',
      //   'title',
      //   'price',
      //   'mostSold',
      //   'discount',
      //   'featured',
      //   'createdAt',
      //   'updatedAt',
      // ],
    });
  }

  private async getLatestProducts(limit: number) {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']],
      limit,
    });
    return products;
  }
}
