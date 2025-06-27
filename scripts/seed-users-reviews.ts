import { Sequelize } from 'sequelize-typescript';
import { User } from '../src/users/entity/users.entity';
import { Review } from '../src/reviews/entity/reviews.entity';
import { Product } from '../src/products/entity/products.entity';
import { createUserObject } from '../test/faker';
import { faker } from '@faker-js/faker';
import * as env from '../src/config/enviroments';

async function seed() {
  // Conexión manual a la base de datos
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: env.DBHOST,
    port: Number(env.DBPORT),
    username: env.DBUSERNAME,
    password: env.DBPASSWORD,
    database: env.TEST_DATABASE || env.DBDATABASE,
    models: [User, Review, Product],
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Obtener productos existentes o crear algunos si no hay
    let products = await Product.findAll();
    if (products.length < 20) {
      const productsToCreate = 20 - products.length;
      for (let i = 0; i < productsToCreate; i++) {
        const product = await Product.create({
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          price: faker.commerce.price(),
          stock: 10,
          sportId: faker.string.uuid(),
        });
        products.push(product);
      }
    }

    // Crear 20 usuarios y 20 reviews
    for (let i = 0; i < 20; i++) {
      const userData = createUserObject();
      const user = await User.create(userData);
      const product = products[i % products.length];
      await Review.create({
        id: faker.string.uuid(),
        userId: user.id,
        productId: product.id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
      });
    }

    console.log('Usuarios y reviews creados exitosamente.');
  } catch (error) {
    console.error('Error al crear usuarios y reviews:', error);
  } finally {
    await sequelize.close();
  }
}

seed();
