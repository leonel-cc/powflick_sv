import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Categories } from '../categories/entity/categories.entity';
import { ProductCategories } from '../categories/entity/productcategories.entity';
import { Customization } from '../products/entity/customization.entity';
import { Product } from '../products/entity/products.entity';
import { CartProduct } from '../shopping-cart/entity/cart-product.entity';
import { ShoppingCart } from '../shopping-cart/entity/shopping-cart.entity';
import { Sport } from '../sport/entity/sport.entity';
import { User } from '../users/entity/users.entity';
import * as env from '../config/enviroments';
import { Direction } from '../directions/entity/directions.entity';
import { UserProductFav } from '../users/entity/userproductfav.entity';
import { Order } from '../orders/entity/order.entity';
import { OrderProduct } from '../orders/entity/orderProduct.entity';
import { Review } from '../reviews/entity/reviews.entity';
import { Messages } from '../messages/entity/messages.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { CouponUser } from '../coupon/entities/coupon-user.entity';
import { Collection } from '../collections/entity/collections.entity';
import { CollectionProduct } from '../collections/entity/collectionProduct.entity';
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      dialectModule: require('pg'),
      host: env.DBHOST,
      port: Number(env.DBPORT),
      username: env.DBUSERNAME,
      password: env.DBPASSWORD,
      database: env.DBDATABASE,
      models: [
        User,
        Product,
        Categories,
        ProductCategories,
        Sport,
        Customization,
        ShoppingCart,
        CartProduct,
        Direction,
        UserProductFav,
        Order,
        OrderProduct,
        Review,
        Messages,
        Coupon,
        CouponUser,
        Collection,
        CollectionProduct,
      ],
      // ssl: true,
      // dialectOptions: {
      //   ssl: {
      //     rejectUnauthorized: true,
      //   },
      // },
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      sync: { force: true },
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule { }
