import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FindOptions, Op, Transaction } from 'sequelize';
import { Product, StateProduct } from './entity/products.entity';
import { SheetsProductsDto } from '../excel-products/dto/sheetsProductsDto';
import { calculateCustomizationPrice } from '../utils/tools';
import { QueryProductsDto } from './dto/query-products.dto';
import {
  PaginatedProductsResponse,
  Response,
} from './interface/serviceInterfaces';
import { Customization } from './entity/customization.entity';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { Sequelize } from 'sequelize-typescript';
import { UserProductFav } from '../users/entity/userproductfav.entity';
import { User } from 'src/users/entity/users.entity';
import { UpdateProductDto } from './dto/update-products.dto';
import { VercelBlobService } from 'src/files/vercel-storage.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly sequelize: Sequelize,
    @Inject(forwardRef(() => VercelBlobService))
    private readonly vercelBlobService: VercelBlobService,
  ) {}

  public async createGenericProduct(
    product: SheetsProductsDto,
    index: number,
  ): Promise<Product> {
    try {
      const genericCreatedProduct = await Product.create({
        id: product.ID,
        title: product.Title.trim(),
        content: product.Content,
        short_description: product['Short Description'],
        date: product.Date,
        stock: Number(product.Stock) || 0,
        regular_price: Number(product['Regular Price'].replace(',', '.')),
        stock_status: product['Stock Status'],
        // URL: product.URL,
        product_categories: product['Product Categories'],
        genders: product.Genders,
        sports: product.Sports,
        colors: product.Colors,
        // images: stringArraying(product.Images),
        slug: product.Slug,
        status: product.Status,
        featured: product.Featured,
        font: product.Font,
        sportId: product.sportId,
      });

      if (!genericCreatedProduct) throw new InternalServerErrorException();
      return genericCreatedProduct;
    } catch (error) {
      throw new InternalServerErrorException(
        `An error occurred while working with the Product entity when creating the product ${
          product.ID
        } in the index: ${index + 2}. ${error.message}`,
      );
    }
  }

  public async findByPkToValidateExistentProduct(
    productId: string,
    options?: FindOptions,
  ): Promise<Product | null> {
    try {
      const genericResponseProduct: Product | null = await Product.findByPk(
        productId,
        options,
      );
      return genericResponseProduct;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred when working with the Product entity when searching for a particular product',
      );
    }
  }

  async oneProduct(id: string): Promise<Product> {
    try {
      const product = await Product.findByPk(id);

      if (!product) throw new NotFoundException('Product not found');

      return product;
    } catch ({ message, status }) {
      throw new HttpException(message, status);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    try {
      const product = await Product.findByPk(id);

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Verificar si no hay datos recibidos para actualizar
      if (
        !Object.values(updateProductDto).some((value) => value !== undefined)
      ) {
        return {
          status: HttpStatus.NOT_MODIFIED,
          message: 'No data received to update.',
        };
      }

      // Si se cambia el title, renombrar la carpeta en el blob de Vercel
      if (updateProductDto.title && updateProductDto.title !== product.title) {
        const oldTitle = product.title;
        const newTitle = updateProductDto.title;
        await this.vercelBlobService.renameFolder(oldTitle, newTitle);
      }

      // Actualizar los campos del producto si se proporcionaron en el DTO
      for (const key in updateProductDto) {
        if (updateProductDto.hasOwnProperty(key)) {
          product[key] = updateProductDto[key] ?? product[key];
        }
      }

      await product.save();

      return {
        status: HttpStatus.OK,
        message: 'The product has been updated successfully.',
        updateProduct: product,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(
          'A server error occurred while trying to update the product',
        );
      }
    }
  }

  async allProducts(
    filters: QueryProductsDto,
    admin = false,
  ): Promise<PaginatedProductsResponse> {
    try {
      const query = {};

      // Aplicar otros filtros según corresponda
      if (filters.sport) query['sports'] = filters.sport;
      if (filters.gender)
        query['genders'] = { [Op.like]: `%${filters.gender}%` };
      if (filters.color) query['colors'] = { [Op.contains]: [filters.color] };
      if (filters.color2)
        query['colors'] = { [Op.contains]: [filters.color, filters.color2] };
      if (filters.category)
        query['product_categories'] = { [Op.like]: `%${filters.category}%` };
      if (filters.minPrice && filters.maxPrice) {
        query['price'] = {
          [Op.gte]: parseFloat(filters.minPrice),
          [Op.lte]: parseFloat(filters.maxPrice),
        };
      } else if (filters.minPrice) {
        query['price'] = { [Op.gte]: parseFloat(filters.minPrice) };
      } else if (filters.maxPrice) {
        query['price'] = { [Op.lte]: parseFloat(filters.maxPrice) };
      }
      if (filters.featured) query['featured'] = filters.featured;
      if (filters.discount) query['discount'] = { [Op.ne]: 0 };
      if (filters.mostSold) query['mostSold'] = filters.mostSold;

      if (!admin) {
        query['status'] = StateProduct.Active;
      }

      // Buscador
      if (filters.search) {
        const keywords = filters.search.trim().split(' ');

        // Construir un array de condiciones de búsqueda para cada palabra
        const whereConditions = keywords.map((keyword) => ({
          title: {
            [Op.iLike]: `%${keyword}%`,
          },
        }));

        query[Op.and] = whereConditions;
      }

      // Realizar ordenamiento
      let order;
      if (filters.order === 'ASC') {
        order = [['price', 'ASC']];
      } else {
        order = [['price', 'DESC']];
      }

      // Realizar la consulta para obtener todos los productos
      const products = await Product.findAll({
        where: query,
        order,
      });

      // Calcular el número total de páginas
      const total = products.length;

      // Contar la cantidad de cada color
      const colorsCount = this.countAtributes(products, 'colors');
      // Contar la cantidad de cada deporte
      const sportCount = this.countAtributes(products, 'sports');
      // Contar la cantidad de cada categoria
      const categoryCount = this.countAtributes(products, 'product_categories');
      // Contar la cantidad de cada genero
      const genderCount = this.countAtributes(products, 'genders');

      // Aplicar paginación
      const limit = parseInt(filters.limit);
      const page = parseInt(filters.page);
      const offset = (page - 1) * limit;
      const paginatedProducts = products.slice(offset, offset + limit);

      // Calcular el número total de páginas
      const limitOfPages = Math.ceil(total / limit);

      const totalPages = Math.ceil(total / Number(limit));

      return {
        page: page,
        prevPage: page === 1 ? null : page - 1,
        nextPage: page === limitOfPages ? null : page + 1,
        totalPages,
        total: limitOfPages,
        products: paginatedProducts,
        count: {
          total,
          sports: sportCount,
          colors: colorsCount,
          categories: categoryCount,
          gender: genderCount,
        },
      };
    } catch (error) {
      throw new HttpException(
        'An error occurred while displaying all products.' + error.message,
        500,
      );
    }
  }

  private countAtributes(
    products: Product[],
    toCount: string,
  ): { [Attr: string]: number } {
    const attributesCount = {};
    products.forEach((product) => {
      if (Array.isArray(product[toCount]))
        product[toCount].forEach((Attr) => {
          attributesCount[Attr] = (attributesCount[Attr] || 0) + 1;
        });
      if (
        typeof product[toCount] === 'string' &&
        !product[toCount].includes('|')
      ) {
        attributesCount[product[toCount]] =
          (attributesCount[product[toCount]] || 0) + 1;
      } else if (product[toCount]?.includes('|')) {
        product[toCount].split('|').forEach((Attr) => {
          attributesCount[Attr] = (attributesCount[Attr] || 0) + 1;
        });
      }
    });
    return attributesCount;
  }

  async setDiscount(
    productsIds: string[],
    discount: number,
  ): Promise<Response> {
    try {
      for (const id of productsIds) {
        const product = await Product.findByPk(id);
        if (!product)
          throw new NotFoundException(
            'The product with the id was not found' + id,
          );
        product.discount = discount;
        await product.save();
      }
      return {
        message: 'Discounts successfully established.',
        status: 201,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async setMostSold(productsIds: string[]): Promise<Response> {
    try {
      for (const id of productsIds) {
        const product = await Product.findByPk(id);
        if (!product)
          throw new NotFoundException(
            'The product with the id was not found' + id,
          );
        product.mostSold = true;
        await product.save();
      }
      return {
        message: 'Products highlighted as best sellers with success.',
        status: 201,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async setCustomization(
    userId: string,
    productId: string,
    customization: CreateCustomizationDto,
  ) {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const thisUser = await User.findByPk(userId);
      const thisProduct = await Product.findByPk(productId);

      customization.productId = productId;
      customization.userId = userId;
      customization.price = calculateCustomizationPrice(customization);
      customization.designName =
        (
          thisUser.firstName.slice(0, 4) +
          Math.floor(Math.random() * (99 - 10 + 1)) +
          10 +
          '-' +
          thisProduct.slug
        ).toUpperCase() + '.pdf';

      const customize = await Customization.create(
        { ...customization },
        { transaction },
      );

      const product = await Product.findByPk(customize.productId, {
        attributes: ['id', 'title', 'sports', 'colors', 'slug', 'images'],
      });

      if (!customize)
        throw new HttpException(
          'An error occurred while creating a customization',
          400,
        );

      await transaction.commit();

      return {
        message: 'Customization completed successfully.',
        status: HttpStatus.CREATED,
        data: {
          product,
          customization: customize,
        },
      };
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      throw new HttpException(error.message, error.status);
    }
  }

  async setBulkCustomizations(
    userId: string,
    productId: string,
    customizations: CreateCustomizationDto[],
  ) {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // Inicializar un array para almacenar las personalizaciones creadas o encontradas
      const createdCustomizations = [];
      const thisUser = await User.findByPk(userId);
      const thisProduct = await Product.findByPk(productId);

      for (const { id, ...customization } of customizations) {
        // Buscar la personalización existente o crear una nueva si no se encuentra
        const created = await Customization.create({
          ...customization,
          productId,
          userId,
          designName:
            (
              thisUser.firstName.slice(0, 4) +
              Math.floor(Math.random() * (99 - 10 + 1)) +
              10 +
              '-' +
              thisProduct.slug
            ).toUpperCase() + '.pdf',
          price: calculateCustomizationPrice(customization),
          transaction,
        });

        // Agregar la personalización creada al array
        createdCustomizations.push(created);
      }

      // Confirmar la transacción
      await transaction.commit();

      return {
        message: 'Successful customizations.',
        status: HttpStatus.CREATED,
        data: {
          customizations: createdCustomizations,
        },
      };
    } catch (error) {
      // Si hay un error, hacer rollback de la transacción
      if (transaction) {
        await transaction.rollback();
      }
      // Lanzar una excepción con el mensaje del error
      throw new HttpException(error.message, error.status);
    }
  }

  async updateCustomization(
    id: string,
    customization: CreateCustomizationDto,
  ): Promise<Response> {
    try {
      customization.price = calculateCustomizationPrice(customization);
      const update = await Customization.update(customization, {
        where: { id },
      });

      if (update[0] === 1) {
        return {
          message: 'Customization successfully updated.',
          status: HttpStatus.ACCEPTED,
        };
      } else
        throw new HttpException('There is no customization with that id', 404);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async deleteCustomization(id: string): Promise<Response> {
    try {
      await Customization.destroy({ where: { id } });
      return {
        message: 'Customization successfully removed',
        status: 200,
      };
    } catch (error) {
      throw new HttpException(
        'There was an error when trying to delete a product customization',
        400,
      );
    }
  }

  async sugestedProducts(options: FindOptions) {
    try {
      const products: Product[] = await Product.findAll(options);
      return products;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async favOrUnfavProduct(
    userId: string,
    productId: string,
    firstCall: boolean,
  ) {
    try {
      const [fav, created] = await UserProductFav.findOrCreate({
        where: { userId, productId },
      });
      if (!created) await fav.destroy();

      const list = await UserProductFav.findAll({
        where: { userId },
        attributes: ['id'],
        include: {
          model: Product,
          attributes: ['id', 'title', 'price', 'sports', 'images'],
        },
      });

      if (created) {
        return {
          statusCode: 201,
          message: 'The product has been added to favorites',
          list,
        };
      } else {
        return {
          statusCode: 201,
          message: 'The product has been removed',
          list,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while adding the product to favorites',
      );
    }
  }

  async getProductsFav(userId: string, { limit, page }: any) {
    try {
      const { rows: allFavs, count: totalItems } =
        await UserProductFav.findAndCountAll({
          where: { userId },
          attributes: ['id'],
          include: {
            model: Product,
            attributes: ['id', 'title', 'price', 'sports', 'images'],
          },
        });

      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = page * limit;
      const paginatedFavs = allFavs.slice(startIndex, startIndex + limit);

      return {
        allFavs: paginatedFavs,
        totalItems,
        totalPages,
        page: Number(page),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllProductsTitles(search: string, limit: boolean) {
    try {
      // Dividir la cadena de búsqueda en palabras individuales
      const keywords = search.trim().split(' ');

      // Construir un array de condiciones de búsqueda para cada palabra
      const whereConditions = keywords.map((keyword) => ({
        title: {
          [Op.iLike]: `%${keyword}%`,
        },
      }));

      // Realizar la consulta con todas las condiciones
      const titles = await Product.findAll({
        where: {
          [Op.and]: whereConditions,
        },
        attributes: ['id', 'title'],
        limit: limit ? 10 : null, // Limitar a las primeras 20 coincidencia
      });

      if (limit) {
        return titles;
      } else {
        const allTitles = [];
        titles.forEach(({ title }) => allTitles.push(title));
        return allTitles;
      }
    } catch (error) {
      // Maneja los errores de manera adecuada
      throw new HttpException(
        'Error when searching for product titles: ' + error.message,
        500,
      );
    }
  }

  async getAllProductsIds() {
    try {
      const ids = await Product.findAll({
        attributes: ['id'],
      });

      const allIds = [];
      ids.forEach(({ id }) => allIds.push(id));
      return allIds;
    } catch (error) {
      // Maneja los errores de manera adecuada
      throw new HttpException(
        'Error when searching for product ids: ' + error.message,
        500,
      );
    }
  }

  async findByTitle(title: string) {
    try {
      // Buscar un producto por su título
      const product = await Product.findOne({
        where: {
          title: {
            [Op.iLike]: title,
          },
        },
      });

      // Retornar el producto encontrado o null si no se encuentra ninguno
      return product;
    } catch (error) {
      // Manejar los errores de manera adecuada
      throw new HttpException(
        'Error when searching for product by title: ' + error.message,
        500,
      );
    }
  }
}
