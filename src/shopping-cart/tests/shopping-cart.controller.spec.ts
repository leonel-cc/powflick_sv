import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartController } from '../shopping-cart.controller';
import { ShoppingCartService } from '../shopping-cart.service';
import { ProductsService } from '../../products/products.service';
import { VercelBlobService } from '../../files/vercel-storage.service';
import { ConfigService } from '@nestjs/config';
import { DatabaseTestModule } from '../../database/database.test.module';
import { BulkCustomizationsToProductCartDto } from '../dto/add.bulkCustomizations.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { User } from '../../users/entity/users.entity';
import { createCustomizationObject, createProductObject, createSportObject, createUserObject } from '../../../test/faker';
import { Product } from '../../products/entity/products.entity';
import { CreateCustomizationDto } from '../../products/dto/create-customization.dto';
import { Sport } from '../../sport/entity/sport.entity';

describe('ShoppingCartController', () => {
  let app: INestApplication;
  let controller: ShoppingCartController;
  let shoppingCartService: ShoppingCartService;
  let userMock: User;
  let sportMock: Sport;
  let productsMock: Product[] = [];
  let customizationsMock: CreateCustomizationDto[] = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseTestModule],
      providers: [
        ShoppingCartService,
        ProductsService,
        VercelBlobService,
        ConfigService,
      ],
      controllers: [ShoppingCartController],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userMock = await User.create(createUserObject());
    controller = module.get<ShoppingCartController>(ShoppingCartController);
    sportMock = await Sport.create(createSportObject());
    shoppingCartService = module.get<ShoppingCartService>(ShoppingCartService);
    productsMock.push(await Product.create(createProductObject(sportMock.id)));
    productsMock.push(await Product.create(createProductObject(sportMock.id)));
    customizationsMock.push(createCustomizationObject(userMock.id, productsMock[0].id));
    customizationsMock.push(createCustomizationObject(userMock.id, productsMock[1].id));
  });

  afterEach(async () => {
    productsMock = [];
    customizationsMock = [];
    await app.close();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add products to cart with bulk customizations', async () => {
    const userId = userMock.id;
    const bulkData: BulkCustomizationsToProductCartDto[] = [
      {
        productId: productsMock[0].id,
        customizations: [customizationsMock[0]],
      },
      {
        productId: productsMock[1].id,
        customizations: [customizationsMock[1]],
      },
    ];

    const mockResponse = {
      statusCode: HttpStatus.OK,
      message: 'Productos agregados con exito!',
    };

    const response = await controller.postProductsInShoppingCartWithBulkCustomization({ userId }, bulkData);
    const cart = await shoppingCartService.getCart(userId);

    expect(response).toEqual(mockResponse);
    expect(cart.products.length).toEqual(bulkData.length);
  });
});