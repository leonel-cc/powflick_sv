import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { API_KEY } from '../config/enviroments';
import { SheetsProductsDto } from './dto/sheetsProductsDto';
import { Product } from '../products/entity/products.entity';
import { ProductsService } from '../products/products.service';
import { ProductCategories } from '../categories/entity/productcategories.entity';
import { CategoriesService } from '../categories/categories.service';
import { arraysAreEqualUnordered, stringArraying } from '../utils/tools';
import { SportService } from '../sport/sport.service';
import * as xlsx from 'xlsx';
// import { crearCarpeta, downloadImage, readFilesInFolder, uploadImageToVercel, uploadLocalImageToVercel } from '../utils/downloadImages';
// import * as fs from 'fs';
// import * as path from 'path';
import { VercelBlobService } from '../files/vercel-storage.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
@Injectable()
export class ExcelProductsService {
  constructor(
    private productsService: ProductsService,
    private categoryService: CategoriesService,
    private sportService: SportService,
    private vercelStorage: VercelBlobService,
  ) { }

  async getSheetsData(url: string): Promise<GoogleSpreadsheet> {
    try {
      const sheetsId = url.split('/')[5];

      const miDoc = new GoogleSpreadsheet(sheetsId, { apiKey: API_KEY });

      await miDoc.loadInfo();

      return miDoc;
    } catch (error) {
      throw new InternalServerErrorException(
        `There was a problem requesting the data to the URL: ${url} ${error.message}`,
      );
    }
  }

  async spreadSheetsToJSON(
    Data: GoogleSpreadsheet,
  ): Promise<SheetsProductsDto[]> {
    try {
      const miSheets = Data.sheetsByIndex[0];

      const rowValues = await miSheets.getCellsInRange('A:T');
      const headers = rowValues[0];
      const objectContainer = [];

      for (const val of Object(rowValues.slice(1, rowValues.length))) {
        const object = {};
        headers.forEach((header: string, index: number) => {
          object[header] = val[index] !== '' && val[index] !== undefined ? val[index] : null;
        });
        const productValidated = await this.validateProduct(object);

        objectContainer.push(productValidated);
      }
      return objectContainer;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateProduct(data: any) {
    // Convertimos el objeto plano en una instancia de SheetsProductsDto
    const productInstance = plainToInstance(SheetsProductsDto, data);

    // Ejecutamos la validación
    const errors = await validate(productInstance);

    if (errors.length > 0) {
      // Creamos un array para almacenar los mensajes de error
      const errorMessages = errors.map(error => {
        // Cada error tiene una propiedad 'constraints', que es un objeto con los mensajes de error
        const constraints = Object.values(error.constraints).join(', ');

        return `${error.property}: ${constraints}`;
      });

      // Lanza una excepción con todos los errores concatenados
      throw new HttpException(`Validation Errors ${productInstance.ID}: \n ${errorMessages.join(' \n ')}`, 400);
    } else {
      console.log('Validación Success. El objeto es válido.');
      return productInstance;
    }
  }

  async JsonToDatabase(
    allProducts: SheetsProductsDto[],
  ) {
    // let i = 0;
    try {
      const Products: Product[] | null = await Product.findAll();
      for (const [index, value] of allProducts.entries()) {
        const thisProduct = Products.find(({ id }) => id === value.ID);

        value.Title = value.Title.split(' ')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');
        /////////////////////////////////////////////////// Guardar imagenes de productos en una carpeta local
        // // Crear carpeta para el producto
        // const basePath = 'uploads/products';
        // const productPath = path.join(basePath, value.Title);
        // crearCarpeta(productPath);

        // // Descargar imágenes
        // stringArraying(value.Images).map(async (url, i) => {
        //   const filename = url.split('/').pop();

        //   await downloadImage(url, productPath, filename);
        // });

        /////////////////////////////////////////////////// Subir imagenes de productos al storage de vercel mediante las url del excel
        // // Subir imágenes a Vercel y obtener las nuevas URLs
        // const imageUrls = await Promise.all(
        //   stringArraying(value.Images).map(async (url) => {
        //     if  (thisProduct.images.includes(url)) return;
        //     const upload = await uploadImageToVercel(url, value.Title);
        //     return upload;
        //   }),
        // );
        // // Actualizar el objeto de producto con las nuevas URLs de las imágenes
        // value.Images = imageUrls.join('|');
        // // value.URL = imageUrls[0];
        // i++;
        // console.log(value.Title, i);

        /////////////////////////////////////////////////// Subir imagenes de productos al storage de vercel mediante una carpeta local
        // Obtener la carpeta de imágenes para el producto
        // const productImagesFolder = path.join('uploads/products', value.Title);

        // // Leer archivos de la carpeta de imágenes
        // const imagePaths = await readFilesInFolder(productImagesFolder);

        // // Subir imágenes a Vercel y obtener las nuevas URLs
        // const imageUrls = await Promise.all(
        //   imagePaths.map(async (imagePath) => {
        //     const imageUrl = await uploadLocalImageToVercel(imagePath, value.Title);
        //     return imageUrl;
        //   }),
        // );
        // console.log(productImagesFolder, i);
        // i++;
        // // Actualizar el objeto de producto con las nuevas URLs de las imágenes
        // value.Images = [...new Set([...thisProduct.images, ...imageUrls])].filter(each => each !== '').join('|');
        // value.URL = imageUrls[0];

        if (thisProduct) {
          if (this.productsAreEqual(thisProduct, value)) {
            console.log(`Product ${thisProduct.title} at index ${index} is already up to date.`);
          } else {
            await this.updateProduct(thisProduct, value, index);
            console.log(value.Title, 'Actualized');
          }
        } else {
          await this.createNewProduct(value, index);
          console.log(value.Title, 'Added');
        }
      }

      return {
        statusCode: 201,
        message: 'Products created / updated successfully!',
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  // Función para verificar si dos productos son iguales
  productsAreEqual(dbProduct: Product, sheetProduct: SheetsProductsDto): boolean {
    // console.log(dbProduct.title === sheetProduct.Title.trim(), 'title');
    // console.log(dbProduct.content === sheetProduct.Content, 'content');
    // console.log(dbProduct.short_description === sheetProduct['Short Description'], 'Short Description');
    // console.log(dbProduct.date === sheetProduct.Date, 'date');
    // console.log(dbProduct.stock === (Number(sheetProduct.Stock) || 0), 'stock');
    // console.log(dbProduct.regular_price === Number(sheetProduct['Regular Price']), 'regular');
    // console.log(dbProduct.stock_status === sheetProduct['Stock Status'], 'status');
    // console.log(dbProduct.product_categories === sheetProduct['Product Categories'], 'category');
    // console.log(dbProduct.genders === sheetProduct.Genders, ' gender');
    // console.log(dbProduct.sports === sheetProduct.Sports, 'spor');
    // console.log(arraysAreEqualUnordered(dbProduct.colors, sheetProduct.Colors), 'colors');
    // console.log(dbProduct.status === sheetProduct.Status, ' statu');
    // console.log(dbProduct.slug === sheetProduct.Slug, ' slug');
    // console.log(dbProduct.font === sheetProduct.Font, 'font');
    // console.log(dbProduct.font_color === sheetProduct['Font Color'], 'fontcolor');
    // console.log(dbProduct.featured === sheetProduct.Featured, ' feat');

    const returned =
      dbProduct.title === sheetProduct.Title.trim() &&
      dbProduct.content === sheetProduct.Content &&
      dbProduct.short_description === sheetProduct['Short Description'] &&
      dbProduct.date === sheetProduct.Date &&
      dbProduct.stock === (Number(sheetProduct.Stock) || 0) &&
      dbProduct.regular_price === Number(sheetProduct['Regular Price']) &&
      dbProduct.stock_status === sheetProduct['Stock Status'] &&
      dbProduct.product_categories === sheetProduct['Product Categories'] &&
      dbProduct.genders === sheetProduct.Genders &&
      dbProduct.sports === sheetProduct.Sports &&
      arraysAreEqualUnordered(dbProduct.colors, sheetProduct.Colors) &&
      // JSON.stringify(dbProduct.images) === JSON.stringify(stringArraying(sheetProduct.Images)) &&
      dbProduct.status === sheetProduct.Status &&
      dbProduct.slug === sheetProduct.Slug &&
      dbProduct.font === sheetProduct.Font &&
      dbProduct.font_color === sheetProduct['Font Color'] &&
      dbProduct.featured === sheetProduct.Featured;

    return returned;
  }

  private async updateProduct(
    thisProduct: Product,
    product: SheetsProductsDto,
    index: number,
  ): Promise<void> {
    try {
      this.destructuringCategoriesStringMethod(product['Product Categories'], index, thisProduct.id);
      const sportId = await this.sportService.getOrCreateSport(product.Sports, index);
      //Se actualiza el producto
      thisProduct.title = product.Title.trim();
      thisProduct.content = product.Content;
      thisProduct.short_description = product['Short Description'];
      thisProduct.date = product.Date;
      thisProduct.stock = Number(product.Stock) || 0;
      thisProduct.regular_price = Number(product['Regular Price'].replace(',', '.'));
      thisProduct.stock_status = product['Stock Status'];
      // thisProduct.URL = product.URL;
      thisProduct.product_categories = product['Product Categories'];
      thisProduct.genders = product.Genders;
      thisProduct.slug = product.Slug;
      thisProduct.sports = product.Sports;
      thisProduct.colors = product.Colors;
      // thisProduct.images = stringArraying(product.Images);
      thisProduct.status = product.Status;
      thisProduct.featured = product.Featured;
      thisProduct.font = product.Font;
      thisProduct.font_color = product['Font Color'];
      thisProduct.sportId = sportId;

      await thisProduct.save();

      return;
    } catch (error) {
      throw new InternalServerErrorException(
        `An error occurred while updating the product ${product.Title}, in the index: ${index + 2}` + error.message,
      );
    }
  }

  private async createNewProduct(
    product: SheetsProductsDto,
    index: number,
  ): Promise<void> {
    try {
      const sportId = await this.sportService.getOrCreateSport(product.Sports, index);

      product = { ...product, sportId };

      const thisProduct: Product = await this.productsService.createGenericProduct(
        product,
        index,
      );

      await this.destructuringCategoriesStringMethod(product['Product Categories'], index, thisProduct.id);

      return;
    } catch (error) {
      console.log(product, index);

      throw new HttpException('Error creating a new product.' + error.message, 500);
    }

  }

  private async destructuringCategoriesStringMethod(categoryString: string, index: number, productId: string) {
    try {
      if (categoryString.includes('|')) {
        categoryString.split('|').map(async (name) => {
          const categoryId: string = await this.categoryService.getOrCreateCategory(
            name,
            index,
          );
          this.createCategoryProductRelation(productId, categoryId);
        },
        );
      } else {
        const categoryId: string = await this.categoryService.getOrCreateCategory(
          categoryString,
          index,
        );
        this.createCategoryProductRelation(productId, categoryId);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  private async createCategoryProductRelation(productId: string, categoryId: string) {
    try {
      await ProductCategories.findOrCreate({ where: { productId, categoryId } });
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating the ProductsCategories relationship. Error:' +
        error.message,
      );
    }
  }

  async getExportProducts(): Promise<Product[]> {
    // Aquí puedes realizar cualquier operación necesaria para recuperar los datos que deseas exportar
    const products = await Product.findAll();

    return products;
  }

  async exportProductsToExcel(products: Product[]) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([
      [
        'ID', 'Title', 'Content', 'Short Description', 'Date', 'Price', 'Regular Price',
        'Stock Status', 'Stock', 'Images', 'URL', 'Genders', 'Sports', 'Product Categories',
        'Slug', 'Colors', 'Status', 'Featured', 'Font', 'Font Color',
      ],
      ...products.map(product => [
        product.id,
        product.title,
        product.content,
        product.short_description,
        product.date,
        product.price,
        product.regular_price.toString().replace(',', '.'),
        product.stock_status,
        product.stock,
        product.images ? product.images.join('|') : null,
        product.URL,
        product.genders,
        product.sports,
        product.product_categories,
        product.slug,
        product.colors ? product.colors.join('|') : null,
        product.status,
        product.featured,
        product.font,
        product.font_color,
      ]),
    ]);

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    const buffer = xlsx.write(workbook, { type: 'buffer' });

    return buffer;
  }
}
