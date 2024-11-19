import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { DatabaseTestModule } from '../../database/database.test.module';
import { Sport } from '../../sport/entity/sport.entity';
import { CreateCustomizationDto } from '../dto/create-customization.dto';
import { Customization } from '../entity/customization.entity';
import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { createCustomizationObject, createProductDtoObject, createProductObject, createSportObject, createUserObject } from '../../../test/faker';
import { SheetsProductsDto } from 'src/excel-products/dto/sheetsProductsDto';
import { User } from '../../users/entity/users.entity';
import { Product } from '../entity/products.entity';
import { UserProductFav } from '../../users/entity/userproductfav.entity';
import { Sequelize } from 'sequelize-typescript';

describe('ProductsService', () => {
  let service: ProductsService;
  let customizationModel: typeof Customization; // Mock del repositorio Customization
  let userProductFavModel: typeof UserProductFav;
  let userMock: User;
  let sportMock: Sport;
  let productDto: SheetsProductsDto;
  let productMock: Product;
  let customizationsMock: CreateCustomizationDto[] = [];
  let sequelize: Sequelize;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseTestModule], // Importa el módulo de base de datos de prueba
      providers: [ProductsService],
    }).compile();

    userMock = await User.create(createUserObject());
    sportMock = await Sport.create(createSportObject());
    productDto = createProductDtoObject(sportMock.id);
    productMock = await Product.create(createProductObject(sportMock.id));
    customizationsMock.push(createCustomizationObject(userMock.id, productMock.id));
    customizationsMock.push(createCustomizationObject(userMock.id, productMock.id));
    service = module.get<ProductsService>(ProductsService);
    customizationModel = Customization;
    userProductFavModel = UserProductFav;
    sequelize = (service as any).sequelize;
  });

  afterEach(async () => {
    customizationsMock = [];
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('should create a product with provided data', async () => {
    const createdProduct = await service.createGenericProduct(productDto, 0);
    expect(createdProduct).toBeDefined();
    expect(createdProduct.id).toBe(productDto.ID);
    expect(createdProduct.sportId).toBe(sportMock.id);
    // Comprueba otras propiedades según sea necesario
  });

  describe('Should create customizations and relations', () => {
    it('should set bulk customizations successfully', async () => {
      const customizations = customizationsMock;

      // Mock de findOrCreate del modelo Customization
      customizationModel.findOrCreate = jest.fn().mockImplementation(async (options) => {
        // Simula la creación o búsqueda de una personalización
        return [{ ...options.defaults }, true];
      });

      // Ejecutar la función
      const result = await service.setBulkCustomizations(userMock.id, productMock.id, customizationsMock);

      expect(customizationModel.findOrCreate).toHaveBeenCalledTimes(customizations.length);
      // Verificar el resultado
      expect(result).toEqual({
        message: 'Personalizaciones realizadas con éxito.',
        status: HttpStatus.CREATED,
        data: {
          customizations,
        },
      });
    });

    it('should throw an error if transaction fails', async () => {
      // Mock de findOrCreate del modelo Customization
      customizationModel.findOrCreate = jest.fn().mockImplementation(async (options) => {
        // Simula la creación o búsqueda de una personalización
        return [{ ...options.defaults }, true];
      });

      // Mock de sequelize.transaction para simular un error
      sequelize.transaction = jest.fn().mockRejectedValue(new HttpException('Transaction failed', 500));

      // Ejecutar la función y verificar que se lance la excepción
      await expect(service.setBulkCustomizations(userMock.id, productMock.id, customizationsMock)).rejects.toThrowError(HttpException);
    });
  });

  describe('favOrUnfavProduct', () => {
    it('should add product to favorites if it does not exist', async () => {
      // Datos de prueba
      const userId = userMock.id;
      const productId = productMock.id;


      // Mock de findOrCreate del modelo UserProductFav
      userProductFavModel.findOrCreate = jest.fn().mockResolvedValue([{}, true]);

      // Ejecutar la función
      const result = await service.favOrUnfavProduct(userId, productId);

      // Verificar que se haya llamado a findOrCreate
      expect(userProductFavModel.findOrCreate).toHaveBeenCalledWith({ where: { userId, productId } });

      // Verificar el resultado
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'El producto se ha agregado a favoritos',
      });
    });

    it('should remove product from favorites if it exists', async () => {
      // Datos de prueba
      const userId = userMock.id;
      const productId = productMock.id;
      // Mock de findOrCreate del modelo UserProductFav
      userProductFavModel.findOrCreate = jest.fn().mockResolvedValue([{ destroy: jest.fn() }, false]);

      // Ejecutar la función
      const result = await service.favOrUnfavProduct(userId, productId);

      // Verificar que se haya llamado a findOrCreate
      expect(userProductFavModel.findOrCreate).toHaveBeenCalledWith({ where: { userId, productId } });

      // Verificar que se haya llamado a destroy
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('El producto se ha eliminado');
    });

    it('should throw error if adding product to favorites fails', async () => {
      // Datos de prueba
      const userId = userMock.id;
      const productId = productMock.id;
      // Mock de findOrCreate del modelo UserProductFav para simular un error
      userProductFavModel.findOrCreate = jest.fn().mockRejectedValue(new Error('Database error'));

      // Ejecutar la función y verificar que se lance la excepción
      await expect(service.favOrUnfavProduct(userId, productId)).rejects.toThrowError(InternalServerErrorException);
    });

    it('should get favorite products successfully', async () => {
      // Datos de prueba
      const userId = userMock.id;
      const productId = productMock.id;
      const limit = 10;
      const page = 0;

      await userProductFavModel.create({ userId, productId });
      // Mock de findAndCountAll del modelo UserProductFav
      userProductFavModel.findAndCountAll = jest.fn().mockResolvedValue({
        rows: [
          productMock,
        ],
        count: 1,
      });

      // Ejecutar la función
      const result = await service.getProductsFav(userId, { limit, page });

      // Verificar el resultado
      expect(result).toEqual({
        allFavs: [
          productMock,
        ],
        totalItems: 1,
        totalPages: 1,
        page: 0,
      });
    });

    it('should throw error if retrieving favorite products fails', async () => {
      // Datos de prueba
      const userId = 'user123';
      const limit = 10;
      const page = 1;

      // Mock de findAndCountAll del modelo UserProductFav para simular un error
      userProductFavModel.findAndCountAll = jest.fn().mockRejectedValue(new Error('Database error'));

      // Ejecutar la función y verificar que se lance la excepción
      await expect(service.getProductsFav(userId, { limit, page })).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('setMostSold', () => {
    it('should set products as most sold successfully', async () => {
      // Datos de prueba
      const productsIds = [productMock.id];
      // Spu de findByPk
      const findByPkSpy = jest.spyOn(Product, 'findByPk').mockResolvedValue(productMock);
      // Ejecutar la función
      const result = await service.setMostSold(productsIds);

      // Verificar que se llame a findByPk y save para cada producto
      expect(findByPkSpy).toHaveBeenCalledTimes(productsIds.length);
      expect(findByPkSpy).toHaveBeenCalledWith(productMock.id);

      // Verificar el resultado
      expect(result).toEqual({
        message: 'Productos destacados como mas vendidos con exito.',
        status: 201,
      });
      for (const id of productsIds) {
        const product = await Product.findByPk(id);
        expect(product).toBeDefined();
        expect(product.mostSold).toEqual(true);
      }

      findByPkSpy.mockRestore();
    });

    it('should throw error if product not found', async () => {
      // Datos de prueba
      const productsIds = ['1', '2'];

      // Mock de findByPk del modelo Product para simular que no se encuentra el producto
      Product.findByPk = jest.fn().mockResolvedValue(null);

      // Ejecutar la función y verificar que se lance la excepción
      await expect(service.setMostSold(productsIds)).rejects.toThrowError(HttpException);
    });

    it('should throw error if product save fails', async () => {
      // Datos de prueba
      const productsIds = ['1', '2'];

      // Mock de findByPk y save del modelo Product para simular un error en la actualización
      Product.findByPk = jest.fn().mockImplementation(async (id) => {
        // Simula la búsqueda del producto por su ID
        return {
          id,
          mostSold: false,
          save: jest.fn().mockRejectedValue(new Error('Save error')),
        };
      });

      // Ejecutar la función y verificar que se lance la excepción
      await expect(service.setMostSold(productsIds)).rejects.toThrowError(HttpException);
    });
  });

  describe('setDiscount', () => {
    it('should set discount for products successfully', async () => {
      // Datos de prueba
      const productsIds = [productMock.id];
      const discount = 10; // 10% de descuento
      const discountInPrice = parseFloat((productMock.price - discount).toFixed(2));

      // Mock de findByPk y save del modelo Product
      const findByPkSpy = jest.spyOn(Product, 'findByPk').mockResolvedValue(productMock);

      // Ejecutar la función
      const result = await service.setDiscount(productsIds, discount);

      // Verificar que se llame a findByPk y save para cada producto
      expect(findByPkSpy).toHaveBeenCalledTimes(productsIds.length);
      expect(findByPkSpy).toHaveBeenCalledWith(productMock.id);


      for (const id of productsIds) {
        const product = await Product.findByPk(id);
        expect(product).toBeDefined();
        expect(product.price).toEqual(discountInPrice); // El nuevo precio debería ser el 90% del precio original (100 - 10%)
        expect(product.discount).toEqual(discount);
      }

      // Verificar el resultado
      expect(result).toEqual({
        message: 'Descuentos establecidos con exito.',
        status: 201,
      });

      findByPkSpy.mockRestore();
    });

    it('should throw error if product not found', async () => {
      // Datos de prueba
      const productsIds = ['1', '2'];
      const discount = 10; // 10% de descuento

      // Mock de findByPk del modelo Product para simular que no se encuentra el producto
      Product.findByPk = jest.fn().mockResolvedValue(null);

      // Ejecutar la función y verificar que se lance la excepción
      await expect(service.setDiscount(productsIds, discount)).rejects.toThrowError(HttpException);
    });

    it('should throw error if product save fails', async () => {
      // Datos de prueba
      const productsIds = ['1', '2'];
      const discount = 10; // 10% de descuento

      // Mock de findByPk y save del modelo Product para simular un error en la actualización
      Product.findByPk = jest.fn().mockImplementation(async (id) => {
        // Simula la búsqueda del producto por su ID
        return {
          id,
          discount: 0,
          save: jest.fn().mockRejectedValue(new Error('Save error')),
        };
      });

      // Ejecutar la función y verificar que se lance la excepción
      await expect(service.setDiscount(productsIds, discount)).rejects.toThrowError(HttpException);
    });
  });

});