import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartService } from '../shopping-cart.service';
import { DatabaseTestModule } from '../../database/database.test.module';
import { ProductsService } from '../../products/products.service';
import { VercelBlobService } from '../../files/vercel-storage.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entity/users.entity';
import { Sport } from '../../sport/entity/sport.entity';
import { createCustomizationObject, createProductObject, createSportObject, createUserObject } from '../../../test/faker';
import { Product } from '../../products/entity/products.entity';
import { Customization } from '../../products/entity/customization.entity';
import { ShoppingCart } from '../entity/shopping-cart.entity';
import { CartProduct } from '../entity/cart-product.entity';


describe('ShoppingCartService', () => {
  let service: ShoppingCartService;
  let userMock: User;
  let sportMock: Sport;
  let cartMock: ShoppingCart;
  let productMock: Product;
  let customizationsMock: Customization[] = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseTestModule],
      providers: [
        ShoppingCartService,
        ProductsService,
        VercelBlobService,
        ConfigService,
      ],
    }).compile();

    userMock = await User.create(createUserObject());
    sportMock = await Sport.create(createSportObject());
    cartMock = await ShoppingCart.findOne({ where: { userId: userMock.id } });
    productMock = await Product.create(createProductObject(sportMock.id));
    customizationsMock.push(await Customization.create(createCustomizationObject(userMock.id, productMock.id)));
    customizationsMock.push(await Customization.create(createCustomizationObject(userMock.id, productMock.id)));
    service = module.get<ShoppingCartService>(ShoppingCartService);
  });

  afterEach(async () => {
    customizationsMock = [];
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('add products to cart', () => {
    it('should add one product to cart', async () => {
      const result = await service.postProductsInCart(
        userMock.id,
        productMock.id,
        customizationsMock.map(customization => customization.id),
      );

      const productInCart = await CartProduct.findOne({ where: { cartId: cartMock.id, productId: productMock.id } });

      // Verificar que el producto fue agregado correctamente
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Producto agregado con exito!');
      expect(productInCart).toBeDefined();
      expect(productInCart.amount).toEqual(customizationsMock.length);
      // Puedes agregar más aserciones aquí según tu lógica de negocio
    });

    it('should add product to cart with bulk customizations', async () => {
      // Configura mocks y datos de prueba necesarios
      const userId = userMock.id;
      const productId = productMock.id;

      // Ejecuta la función a probar
      const result = await service.postProductsInCartBulkCustomization(userId, productId, customizationsMock);

      const productInCart = await CartProduct.findOne({ where: { cartId: cartMock.id, productId: productMock.id } });

      // Realiza las aserciones necesarias
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Producto agregado con exito!');
      expect(productInCart).toBeDefined();
      expect(productInCart.amount).toEqual(customizationsMock.length);
      // Agrega más aserciones según sea necesario
    });
  });

  describe('get cart', () => {
    it('get cart by userId', async () => {
      // Configura los mocks y datos de prueba necesarios
      const userId = userMock.id;
      const productId = productMock.id;
      const total = parseFloat((customizationsMock.reduce((acc, { price }) => acc += price, 0) + productMock.price * customizationsMock.length).toFixed(2));
      await service.postProductsInCartBulkCustomization(userId, productId, customizationsMock);

      // Ejecuta la función a probar
      const result = await service.getCart(userId);

      // Realiza las aserciones necesarias
      expect(result).toBeDefined();
      expect(result.id).toEqual(cartMock.id);
      expect(result.total).toEqual(total);
      expect(result.products[0].id).toEqual(productId);
      expect(result.products[0].customizations.length).toEqual(customizationsMock.length);
      // Agrega más aserciones según sea necesario
    });

    it('get cart by cartId', async () => {
      // Configura los mocks y datos de prueba necesarios
      const userId = userMock.id;
      const productId = productMock.id;
      const total = parseFloat((customizationsMock.reduce((acc, { price }) => acc += price, 0) + productMock.price * customizationsMock.length).toFixed(2));
      await service.postProductsInCartBulkCustomization(userId, productId, customizationsMock);

      // Ejecuta la función a probar
      const result = await service.getCartProducts(cartMock.id);

      // Realiza las aserciones necesarias
      expect(result).toBeDefined();
      expect(result.id).toEqual(cartMock.id);
      expect(result.total).toEqual(total);
      expect(result.products[0].id).toEqual(productId);
      expect(result.products[0].customizations.length).toEqual(customizationsMock.length);
      // Agrega más aserciones según sea necesario
    });
  });
});