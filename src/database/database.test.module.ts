// database.test.module.ts

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

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      dialectModule: require('pg'),
      host: env.DBHOST,
      port: Number(env.DBPORT),
      username: env.DBUSERNAME,
      password: env.DBPASSWORD,
      database: env.TEST_DATABASE, // Usar una base de datos de prueba separada
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
      ],
      ssl: false, // Deshabilitar SSL para entorno de prueba
      autoLoadModels: true,
      synchronize: true, // Esto creará las tablas automáticamente
      logging: false,
      sync: { force: true }, // Esto eliminará y volverá a crear todas las tablas en cada reinicio de la prueba
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseTestModule {}
