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
import { CollectionsService } from 'src/collections/collections.service';
import { TagsService } from 'src/tags/tags.service';
import { CollectionProduct } from 'src/collections/entity/collectionProduct.entity';
import { ProductTags } from 'src/tags/entity/productTags.entity';
import { Collection } from 'src/collections/entity/collections.entity';
import { Tags } from 'src/tags/entity/tags.entity';
@Injectable()
export class ExcelProductsService {
  constructor(
    private productsService: ProductsService,
    private categoryService: CategoriesService,
    private collectionsService: CollectionsService,
    private tagsService: TagsService,
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

      const rowValues = await miSheets.getCellsInRange('A:W');
      const headers = rowValues[0];
      const objectContainer = [];

      for (const val of Object(rowValues.slice(1, rowValues.length))) {
        const object: any = {};
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
      throw new HttpException(`Validation Errors ${productInstance.ID}: \n ${errorMessages.join(' \n ')}`, 402);
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
      throw new HttpException(error.message + 'JSONTODATABASE', error.status);
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
      dbProduct.product_collections === sheetProduct['Product Collections'] &&
      dbProduct.product_tags === sheetProduct.Tags &&
      dbProduct.score === Number(sheetProduct.Score) &&
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
      this.destructuringCollectionsStringMethod(product['Product Collections'], index, thisProduct.id);
      this.destructuringTagsStringMethod(product.Tags, index, thisProduct.id);

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
      thisProduct.product_collections = product['Product Collections'];
      thisProduct.product_tags = product.Tags;
      thisProduct.score = Number(product.Score);
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
      await this.destructuringCollectionsStringMethod(product['Product Collections'], index, thisProduct.id);
      await this.destructuringTagsStringMethod(product.Tags, index, thisProduct.id);

      return;
    } catch (error) {
      console.log(product, index);

      throw new HttpException('Error creating a new product.' + error.message, 500);
    }

  }

  private async destructuringCategoriesStringMethod(categoryString: string, index: number, productId: string) {
    try {
      if (!categoryString) return;
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
      throw new HttpException(error.message + 'categories', error.status);
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

  private async destructuringCollectionsStringMethod(collectionString: string, index: number, productId: string) {
    try {
      if (!collectionString) return;
      if (collectionString.includes('|')) {
        collectionString.split('|').map(async (title) => {
          const collectionId: string = await this.collectionsService.getOrCreateCollections(
            title,
            index,
          );
          this.createCollectionsProductRelation(productId, collectionId);
        },
        );
      } else {
        const collectionId: string = await this.collectionsService.getOrCreateCollections(
          collectionString,
          index,
        );
        this.createCollectionsProductRelation(productId, collectionId);
      }
    } catch (error) {
      throw new HttpException(error.message + 'collections', error.status);
    }
  }

  private async createCollectionsProductRelation(productId: string, collectionId: string) {
    try {
      await CollectionProduct.findOrCreate({ where: { productId, collectionId } });
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating the ProductsCategories relationship. Error:' +
        error.message,
      );
    }
  }

  private async destructuringTagsStringMethod(tagsString: string, index: number, productId: string) {
    try {
      if (!tagsString) return;
      if (tagsString.includes('|')) {
        tagsString.split('|').map(async (name) => {
          const tagId: string = await this.tagsService.getOrCreateTags(
            name,
            index,
          );
          this.createTagsProductRelation(productId, tagId);
        },
        );
      } else {
        const tagId: string = await this.tagsService.getOrCreateTags(
          tagsString,
          index,
        );
        this.createTagsProductRelation(productId, tagId);
      }
    } catch (error) {
      throw new HttpException(error.message + 'tags', error.status);
    }
  }

  private async createTagsProductRelation(productId: string, tagId: string) {
    try {
      await ProductTags.findOrCreate({ where: { productId, tagId } });
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating the ProductsCategories relationship. Error:' +
        error.message,
      );
    }
  }

  async getExportProducts(): Promise<Product[]> {
    // Aquí puedes realizar cualquier operación necesaria para recuperar los datos que deseas exportar
    const products = await Product.findAll({
      include: [
        {
          model: Collection, // Modelo relacionado
          attributes: ['title'], // Solo traer el título
        },
        {
          model: Tags, // Modelo relacionado
          attributes: ['name'], // Solo traer el título
        },
      ],
    });

    return products;
  }

  async exportProductsToExcel(products: Product[]) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([
      [
        'ID', 'Title', 'Content', 'Short Description', 'Date', 'Price', 'Regular Price',
        'Stock Status', 'Stock', 'Images', 'URL', 'Genders', 'Sports', 'Product Categories',
        'Product Collections', 'Tags', 'Score', 'Slug', 'Colors', 'Status', 'Featured', 'Font', 'Font Color',
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
        product.genders || 'Men|Women|Kids',
        product.sports,
        product.product_categories,
        product.product_collections,
        product.product_tags,
        product.score,
        product.slug,
        product.colors ? product.colors.join('|') : null,
        product.status,
        product.featured,
        product.font || 'Arial',
        product.font_color || '#ffffff',
      ]),
    ]);

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    const buffer = xlsx.write(workbook, { type: 'buffer' });

    return buffer;
  }

  async exportProductsToExcelMerchant(products: Product[]) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([
      // Encabezados oficiales de Google Merchant Center
      [
        'id', 'title', 'description', 'availability', 'availability date', 'expiration date', 'link',
        'mobile link', 'image link', 'price', 'sale price', 'sale price effective date', 'identifier exists',
        'gtin', 'mpn', 'brand', 'product highlight', 'product detail', 'additional image link', 'condition',
        'adult', 'color', 'size', 'size type', 'size system', 'gender', 'material', 'pattern', 'age group',
        'multipack', 'is bundle', 'unit pricing measure', 'unit pricing base measure', 'energy efficiency class',
        'min energy efficiency class', 'max energy efficiency class', 'item group id', 'sell on google quantity',
      ],
      ...products.map(product => [
        product.id,
        product.title,
        product.content || product.short_description || '', // Descripción priorizando contenido disponible
        product.status === 'publish' ? 'in_stock' : 'out_of_stock',
        '', // Fecha de disponibilidad (si aplica)
        '', // Fecha de expiración (si aplica)
        'https://www.powflick.com/products/' + product.slug,
        'https://www.powflick.com/products/' + product.slug, // Enlace móvil (opcional)
        product.URL || '', // Imagen principal
        `${product.regular_price.toFixed(2)} USD`, // Precio con formato correcto
        product.price ? `${product.price.toFixed(2)} USD` : '', // Precio en oferta si aplica
        '', // Rango de fecha para precio en oferta (si aplica)
        'TRUE', // `identifier exists` (puede cambiarse según disponibilidad de GTIN/MPN)
        '', // Código de barras (si aplica)
        product.slug || product.id, // MPN: usa el ID si no hay otro identificador
        'Pow Flick', // Marca fija o dinámica según disponibilidad
        '', // Resumen de características destacadas
        '', // Detalles adicionales del producto
        product.images?.slice(1).join(', ') || '', // Imágenes adicionales si hay más de una
        'new', // Condición del producto (new, refurbished, used)
        'no', // `adult` (ajustar si aplica)
        product.colors?.join(', ') || '', // Colores
        'All', // Tallas
        '', // Tipo de talla (regular, petite, plus, etc.)
        '', // Sistema de tallas (US, UK, EU, etc.)
        'unisex', // Género
        '', // Materiales
        '', // Patrones
        'adult', // Grupo de edad (ajustar según el producto)
        'no', // Multipack (si aplica)
        'no', // Es un paquete (`is bundle`)
        '', // Medida de precio unitario
        '', // Base de medida de precio unitario
        '', // Clase de eficiencia energética (si aplica)
        '', // Mínima eficiencia energética (si aplica)
        '', // Máxima eficiencia energética (si aplica)
        '', // ID de grupo de artículos (para variantes)
        '', // Cantidad vendida en Google Shopping
      ]),
    ]);

    xlsx.utils.book_append_sheet(workbook, worksheet, 'MerchantProducts');
    return xlsx.write(workbook, { type: 'buffer' });
  }

}
