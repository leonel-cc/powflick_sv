import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Neck,
  Socks,
  Shorts,
  Pants,
  sportsConfig,
  withOrWithoutShort,
  // PaymentMethods,
  // ShippingTypes,
  // SizeGuide,
  Materials,
  SizeType,
  defaultImage,
  Technique,
} from './utils/detail.enum';
import { Product } from './products/entity/products.entity';
import { Review, ShowType } from './reviews/entity/reviews.entity';
import { User } from './users/entity/users.entity';
import { Op, Sequelize } from 'sequelize';
import { CategoriesService } from './categories/categories.service';
import { CollectionsService } from './collections/collections.service';
import { Categories } from './categories/entity/categories.entity';
import { Collection } from './collections/entity/collections.entity';
import { Tags } from './tags/entity/tags.entity';

@Injectable()
export class AppService {
  constructor(
    private readonly categoryService: CategoriesService,
    private readonly collectionsService: CollectionsService,
  ) { }

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

      const categoryNames = product.categories || [];
      const collectionNames = product.collections || [];
      const tagNames = product.tags || [];

      const reviews = await Review.findAll({
        where: { isActive: true },
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email'],
          },
          {
            model: Product,
            attributes: ['id', 'title', 'images', 'slug', 'URL'],
            required: true,
            include: [
              {
                model: Categories,
                where: {
                  name: { [Op.in]: categoryNames },
                },
                required: false,
              },
              {
                model: Collection,
                where: {
                  title: { [Op.in]: collectionNames },
                },
                required: false,
              },
              {
                model: Tags,
                where: {
                  name: { [Op.in]: tagNames },
                },
                required: false,
              },
            ],
          },
        ],
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

      console.log(reviews.length);

      return {
        product,
        sugestedProducts,
        frequentlyBought,
        reviews,
        Default: defaultImage[sport],
        Neck: neck ? Neck : null,
        Socks: socks ? Socks : null,
        Shorts: shorts ? Shorts(sport) : !pants && !shorts ? withOrWithoutShort : null,
        Pants: pants ? Pants : null,
        Materials: Materials,
        Technique: Technique,
        // PaymentMethods,
        // ShippingTypes,
        Size: SizeType,
        // SizeGuide: SizeGuide[sport],
      };
    } catch (error) {
      console.log('error', error);

      throw new HttpException(
        'An error occurred while obtaining the detail validations',
        400,
      );
    }
  }


  async getLanding() {
    try {
      const modal = await this.getRandomProducts(5);
      const reviews = await Review.findAll({
        where: {
          isActive: true,
          show: {
            [Op.not]: ShowType.DETAIL, // Excluye las reviews con show = 'DETAIL'
          },
        },
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
          'show',
          'productId',
          'rating',
          'image',
          'createdAt',
          'updatedAt',
        ],
      });

      const featuredProducts = await this.getProductsByCondition({
        featured: true,
        status: 'publish',
        password: null,
        influencer_id: null,
      });

      const mostSoldProducts = await this.getProductsByCondition({
        mostSold: true,
        status: 'publish',
        password: null,
        influencer_id: null,
      });

      const discountProducts = await this.getProductsByCondition({
        discount: { [Op.gt]: 0 },
        status: 'publish',
        password: null,
        influencer_id: null,
      });

      const designYourGameSection = await this.designYourGameSection(16, ['Retro', 'Throwback Vibes', 'Tropical', 'Woman'], ['Soccer']);

      // // Obtener los últimos productos
      // const latestProducts = await this.getLatestProducts(3);
      // const bestWeekProducts = await this.getRandomProducts(3);
      // const popularProducts = await this.getRandomProducts(3);
      // const saleProducts = await this.getRandomProducts(3);

      return {
        landing: {
          reviews,
          modal,
          collections: {
            featuredProducts,
            mostSoldProducts,
            discountProducts,
            designYourGameSection,
            // latestProducts,
            // bestWeekProducts,
            // popularProducts,
            // saleProducts,
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

  async getNavbar() {
    try {
      const categories = await this.categoryService.getAllTitles();
      const collections =
        await this.collectionsService.getCollectionNamesWithProducts();

      // Asociar las colecciones que corresponden a cada categoría
      const categoriesWithCollections = categories.map(category => {
        // Filtrar las colecciones que tienen productos de esta categoría
        const filteredCollections = collections
          .filter(collection =>
            collection.products?.some(product =>
              product.categories.some(c => c.name.toLowerCase() === category.toLowerCase()), // Verifica si el producto pertenece a la categoría
            ),
          )
          .map(collection => ({
            title: collection.title,
            products: collection.products?.filter(product =>
              product.categories.some(c => c.name.toLowerCase() === category.toLocaleLowerCase()), // Solo productos de la categoría actual
            ).sort((a, b) => a.score - b.score) // Orden por score descendente
              .slice(0, 3),
          }));

        return {
          title: category,
          child: filteredCollections, // Añadir las colecciones filtradas como "child"
        };
      });

      return {
        navbar: {
          categories: categoriesWithCollections.filter(
            category => category.child.length > 0, // Filtrar categorías que tienen colecciones
          ),
        },
      };
    } catch (error) {
      console.error('Error obtaining navbar data:', error);
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
      where: { status: 'publish' },
      offset: randomIndex,
      limit,
      order: Sequelize.literal('RANDOM()'),
    });
  }

  // Método para obtener productos por condición
  private async getProductsByCondition(condition: any) {
    return Product.findAll({
      where: condition,
      include: [
        {
          model: Categories, // Especifica el modelo relacionado
          attributes: ['name'],
        },
        {
          model: Collection, // Especifica el modelo relacionado
          attributes: ['title'],
        },
        {
          model: Tags, // Especifica el modelo relacionado
          attributes: ['name'],
        },
      ],
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

  private async designYourGameSection(
    limit = 12,
    selectedCollections: string[] = [],
    selectedCategories: string[] = [],
  ) {
    const collectionFilter = selectedCollections.length
      ? {
        title: {
          [Op.iLike]: { [Op.any]: selectedCollections.map((t) => t.toLowerCase()) },
        },
      }
      : undefined;

    const collections = await Collection.findAll({ where: collectionFilter });

    // Base includes con posible filtro por categorías
    const baseIncludes: any[] = [
      {
        model: Categories,
        attributes: ['name'],
        ...(selectedCategories.length && {
          where: {
            [Op.or]: selectedCategories.map((c) => ({
              name: {
                [Op.iLike]: `%${c.toLowerCase()}%`,
              },
            })),
          },
        }),
      },
      { model: Collection, attributes: ['title'] },
      { model: Tags, attributes: ['name'] },
    ];

    const order: [string, 'ASC' | 'DESC'][] = [['score', 'ASC']];

    const topPickProducts = await Product.findAll({
      limit,
      include: baseIncludes,
      order,
      where: { featured: true, status: 'publish', password: null },
    });

    const productsPerCollection = await Promise.all(
      collections.map((collection) =>
        Product.findAll({
          include: [
            ...baseIncludes,
            {
              model: Collection,
              where: { id: collection.id },
              attributes: [],
            },
          ],
          where: { status: 'publish', password: null },
          limit,
          order,
        }),
      ),
    );

    return {
      collections: ['Top Picks', ...collections.map((c) => c.title)],
      allProducts: Array.from(
        new Map(
          [...topPickProducts, ...productsPerCollection.flat()].map((p) => [p.id, p]),
        ).values(),
      ),
    };
  }

}
