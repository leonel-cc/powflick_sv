import { faker } from '@faker-js/faker';
import {
  CreateCustomizationDto,
  FrontSideDto,
} from '../src/products/dto/create-customization.dto';
import {
  MaterialsType,
  NeckType,
  PantsType,
  ShortsType,
  SizeType,
  SleeveType,
  SocksType,
} from '../src/products/enum/customization.enum';
import { StateProduct } from '../src/products/entity/products.entity';
import { calculateCustomizationPrice } from '../src/utils/tools';

export const createUserObject = () => {
  const userId = faker.string.uuid();
  const user = {
    userId,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    id: faker.string.uuid(),
    username: faker.word.words(),
    email: faker.internet.email(),
    password: 'daspokdas.',
    phone: faker.phone.number(),
    rol: 'user',
    isActive: true,
    directions: faker.location.city(),
  };
  return user;
};

export const createSportObject = () => {
  const sport = {
    id: faker.string.uuid(),
    name: faker.commerce.department(),
  };
  return sport;
};

export const createCustomizationObject = (
  userId: string,
  productId: string,
) => {
  const frontSide: any = {
    logoUrl: 'http://example.com/logo.png',
    logoId: 'logo123',
    logoPosition: { x: 10, y: 20 },
    logoSize: 50,
    text: 'Custom Text',
    font: 'Arial',
    textPosition: { x: 30, y: 40 },
    textSize: 20,
    textColor: 'blue',
    number: '123',
    numberPosition: { x: 50, y: 60 },
    numberSize: 30,
    numberColor: 'red',
  };

  const customization = {
    id: faker.string.uuid(),
    userId: userId,
    price: 0,
    productId: productId,
    size: SizeType.L10_WOMEN,
    frontSide: frontSide,
    backSide: frontSide, // Usamos los mismos datos para el lado trasero en este ejemplo
    sleeve: SleeveType.Long,
    socks: SocksType['Black (+$8.00)'],
    pants: PantsType.Black,
    shorts: ShortsType.Blue,
    materials: MaterialsType['08HT'],
    neck: NeckType.Default,
  };

  customization.price = calculateCustomizationPrice(customization);

  return customization;
};

export const createCustomization = (userId: string, productId: string) => {
  const frontSide: any = {
    logoUrl: 'http://example.com/logo.png',
    logoId: 'logo123',
    logoPosition: { x: 10, y: 20 },
    logoSize: 50,
    text: 'Custom Text',
    font: 'Arial',
    textPosition: { x: 30, y: 40 },
    textSize: 20,
    textColor: 'blue',
    number: '123',
    numberPosition: { x: 50, y: 60 },
    numberSize: 30,
    numberColor: 'red',
  };

  const customization: CreateCustomizationDto = {
    id: faker.string.uuid(),
    userId: userId,
    productId: productId,
    size: SizeType.L10_WOMEN,
    frontSide: frontSide,
    backSide: frontSide, // Usamos los mismos datos para el lado trasero en este ejemplo
    sleeve: SleeveType.Long,
    socks: SocksType['Black (+$8.00)'],
    pants: PantsType.Black,
    shorts: ShortsType.Blue,
    materials: MaterialsType['08HT'],
    neck: NeckType.Default,
  };

  customization.price = calculateCustomizationPrice(customization);

  return customization;
};

export const createProductDtoObject = (sportId: string) => {
  const SheetsProductsDto = {
    ID: faker.string.uuid(),
    Title: faker.commerce.productName(),
    Content: 'Product Content',
    'Short Description': faker.commerce.productDescription(),
    Date: new Date().toISOString(),
    Stock: '10',
    Price: '20.00',
    'Regular Price': '100',
    'Stock Status': 'instock',
    URL: 'http://example.com',
    'Product categories': 'Category 1, Category 2',
    genders: 'Male, Female',
    sports: 'Football, Basketball',
    colors: 'Red, Blue',
    images: 'image1.jpg, image2.jpg',
    Slug: 'test-product',
    Status: StateProduct.Active,
    Featured: 'true',
    sportId: sportId,
  };

  return SheetsProductsDto;
};

export const createProductObject = (sportId: string) => {
  const product = {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    content: 'Product Content',
    short_description: faker.commerce.productDescription(),
    date: new Date().toISOString(),
    stock: 0,
    price: 20.0,
    regular_price: 100,
    URL: 'http://example.com',
    product_categories: 'Category 1, Category 2',
    genders: 'Male, Female',
    sports: 'Football, Basketball',
    colors: ['Red, Blue'],
    images: ['image1.jpg, image2.jpg'],
    slug: 'test-product',
    stock_status: 'instock',
    status: StateProduct.Active,
    featured: true,
    sportId: sportId,
  };

  return product;
};
