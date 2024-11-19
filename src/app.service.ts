import { HttpException, Injectable } from '@nestjs/common';
import { Neck, Socks, Shorts, Pants, sportsConfig, withOrWithoutShort, PaymentMethods, ShippingTypes, SizeGuide, Materials, SizeType, defaultImage } from './utils/detail.enum';
import { Product } from './products/entity/products.entity';
import { Review } from './reviews/entity/reviews.entity';
import { User } from './users/entity/users.entity';

@Injectable()
export class AppService {
  hello() {
    return 'hello world';
  }

  async getDetail(sport: string, product: Product, sugestedProducts: Product[]) {
    try {
      const { neck, socks, shorts, pants } = sportsConfig[sport];

      const reviews = await Review.findAll({
        where: { productId: product.id, isActive: true },
        include: {
          model: User,
          attributes: ['firstName', 'lastName', 'email'],
        },
        attributes: ['id', 'title', 'review', 'type', 'orderId', 'productId', 'rating', 'image', 'createdAt', 'updatedAt'],
      });

      return {
        product,
        sugestedProducts,
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
      throw new HttpException('An error occurred while obtaining the detail validations', 400);
    }
  }
}
