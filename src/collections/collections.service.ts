import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Collection } from './entity/collections.entity';
import { CollectionProduct } from './entity/collectionProduct.entity';
import { Product } from '../products/entity/products.entity';
import { Op } from 'sequelize';

@Injectable()
export class CollectionsService {
  async create(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const collection = new Collection();
    collection.title = createCollectionDto.title;
    collection.content = createCollectionDto.content;
    await collection.save();

    return collection;
  }

  async findAll(): Promise<Collection[]> {
    const collections = await Collection.findAll({
      include: [
        {
          model: Product,
          through: { attributes: [] }, // Include products through CollectionProduct
        },
      ],
    });

    // Añadir la cantidad de productos asociados a cada colección
    collections.forEach(collection => {
      (collection as any).productCount = collection.products.length;
    });

    return collections;
  }

  async findOne(collectionId: string) {
    let collection = {};
    if (collectionId !== 'create') {
      collection = await Collection.findByPk(collectionId, {
        include: { model: Product },  // Incluye los productos asociados
      });

      if (!collection) {
        throw new HttpException('Collection not found', 404);
      }
    }

    const availableProducts = await Product.findAll({
      attributes: ['title'], // Solo traer el campo 'title'
    });

    return { collection, availableProducts: availableProducts.map(p => p.title) };
  }

  async update(id: string, updateCollectionDto: UpdateCollectionDto): Promise<Collection> {
    const collection = await Collection.findByPk(id);
    collection.title = updateCollectionDto.title ?? collection.title;
    collection.content = updateCollectionDto.content ?? collection.content;
    await collection.save();

    return collection;
  }

  async remove(id: string): Promise<void> {
    const collection = await Collection.findByPk(id);
    await collection.destroy();
  }

  async createMockCollectionWithProducts(): Promise<string> {
    // Obtener todos los productos
    const products = await Product.findAll();
    console.log('Productos encontrados:', products.length);

    // Extraer todas las palabras clave de los títulos de los productos
    const sports = [
      'Soccer', 'Basketball', 'Tennis', 'Baseball', 'Golf', 'Hockey', 'Cricket', 'Rugby', 'Volleyball', 'Swimming',
    ];
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown', 'gray'];
    const titleKeywords = products.map(product => {
      const words = product.title.split(' ');
      return words.length >= 3 ? words[2] : null;
    }).filter(keyword => keyword !== null && !colors.includes(keyword.toLowerCase()) && !sports.map(sport => sport.toLowerCase()).includes(keyword.toLowerCase()));
    console.log('Palabras clave de los títulos:', titleKeywords);

    // Contar la frecuencia de cada palabra clave
    const keywordCounts = titleKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {});
    console.log('Conteo de palabras clave:', keywordCounts);

    // Ordenar las palabras clave por frecuencia y limitar el número de colecciones
    const sortedKeywords = Object.keys(keywordCounts).sort((a, b) => keywordCounts[b] - keywordCounts[a]);
    const topKeywords = sortedKeywords.slice(0, 10); // Limitar a las 10 palabras clave más comunes
    console.log('Palabras clave más comunes:', topKeywords);

    // Crear colecciones para las palabras clave más comunes
    for (const keyword of topKeywords) {
      const collection = new Collection();
      collection.title = keyword;
      collection.content = `Collection of products with "${keyword}" in the title`;
      await collection.save();
      console.log('Colección creada:', collection.title);

      // Encontrar todos los productos relacionados que contienen la palabra clave en el título
      const relatedProducts = await Product.findAll({
        where: {
          title: {
            [Op.like]: `%${keyword}%`,
          },
        },
      });
      console.log(`Productos relacionados con "${keyword}":`, relatedProducts.length);

      // Asociar los productos relacionados con la colección
      for (const product of relatedProducts) {
        const collectionProduct = new CollectionProduct();
        collectionProduct.collectionId = collection.id;
        collectionProduct.productId = product.id;
        await collectionProduct.save();
      }
    }

    return 'Colecciones creadas con éxito';
  }

  async getCollectionNames(): Promise<string[]> {
    const collections = await Collection.findAll({
      attributes: ['title'],
    });
    return collections.map(collection => collection.title);
  }

  async getCollectionNamesWithProducts(): Promise<{ title: string, products: Product[] }[]> {
    const collections = await Collection.findAll({
      attributes: ['title'],
      include: [
        {
          model: Product,
          where: { status: 'publish' },
          through: { attributes: [] },
        },
      ],
    });

    return collections.map(collection => ({
      title: collection.title,
      products: collection.products, // Limitar a 5 productos en el resultado final
    }));
  }

  async createCollectionWithProducts(
    collectionDto: any,
  ) {
    try {
      const { products, ...coll } = collectionDto;
      // 1. Crear la categoría
      const [collection] = await Collection.findOrCreate({ where: { title: coll.title }, defaults: { ...coll } });

      // 2. Buscar los productos por título y obtener sus IDs
      if (products.length > 0) {
        const ids = await Promise.all(
          products.map(async (title) => {
            const product = await Product.findOne({ where: { title } });
            return product?.id; // Devuelve el ID del producto si existe
          }),
        );

        // Filtrar IDs nulos o indefinidos (por si algún título no tiene producto asociado)
        const validIds = ids.filter((id) => id !== null && id !== undefined);

        // 3. Crear relaciones en la tabla intermedia
        if (validIds.length > 0) {
          await CollectionProduct.bulkCreate(
            validIds.map((productId) => ({
              collectionId: collection.id,
              productId,
            })),
          );
        }
      }

      return collection;
    } catch (error) {
      throw new HttpException('Error creating category with products', 500);
    }
  }

  async getAllAdmin(page: number, limit: number, search?: string) {
    try {
      const offset = (page - 1) * limit;

      // Configurar el filtro de búsqueda
      let whereClause = null;
      if (search) whereClause = { title: { [Op.iLike]: `%${search}%` } }; // Usando operadores de Sequelize

      // Obtener el total de categorías
      const total = await Collection.count({ where: whereClause });

      // Obtener las categorías paginadas
      const allCollection = await Collection.findAll({
        where: whereClause,
        offset,
        limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        page,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        totalPages,
        total,
        collections: allCollection,
      };
    } catch (error) {
      throw new HttpException('Error to get collection', 500);
    }
  }

  async updateCollectionProducts(
    collectionId: string,
    productTitle: string[],
    colectionDto?: any, // Nuevo parámetro opcional para el nombre de la categoría
  ) {
    try {
      // 1. Verifica si la categoría existe
      const collection = await Collection.findByPk(collectionId, {
        include: { model: Product },
      });

      if (!collection) {
        throw new HttpException('Collection not found', 404);
      }

      // 2. Verificar y manejar el intercambio de órdenes si `order` está presente en el DTO
      if (colectionDto?.order !== undefined) {
        const newOrder = colectionDto.order;

        // Buscar una colección con el mismo orden
        const existingCollection = await Collection.findOne({
          where: { order: newOrder },
        });

        if (existingCollection && existingCollection.id !== collectionId) {
          // Intercambiar las órdenes entre la colección existente y la actual
          const tempOrder = collection.order; // Guardar la orden actual de la colección
          collection.order = newOrder; // Asignar la nueva orden a la colección actual
          existingCollection.order = tempOrder; // Asignar la orden actual a la colección existente
          await existingCollection.save(); // Guardar cambios en la colección existente
        } else {
          // Si no hay conflicto, simplemente asigna la nueva orden
          collection.order = newOrder;
        }
      }

      collection.title = colectionDto.title ?? collection.title;
      collection.content = colectionDto.content ?? collection.content;
      collection.type = colectionDto.type ?? collection.type;

      await collection.save();
      // 3. Obtener los productos actualmente relacionados
      const currentProductTitle = collection.products.map((product) => product.title);

      // 4. Identificar los productos a añadir y los productos a eliminar
      const productsToAdd = productTitle.filter((title) => !currentProductTitle.includes(title));
      const productsToRemove = currentProductTitle.filter((title) => !productTitle.includes(title));

      // 5. Crear relaciones nuevas
      if (productsToAdd.length > 0) {
        // Buscar los productos por título y obtener sus IDs
        const ids = await Promise.all(
          productsToAdd.map(async (title) => {
            const product = await Product.findOne({ where: { title } });
            return product?.id; // Devuelve el ID del producto si existe
          }),
        );

        // Filtrar IDs nulos o indefinidos (por si algún título no tiene producto asociado)
        const validIds = ids.filter((id) => id !== null && id !== undefined);

        // Crear relaciones en la tabla intermedia
        await CollectionProduct.bulkCreate(
          validIds.map((productId) => ({
            collectionId,
            productId,
          })),
        );
      }

      // 6. Eliminar relaciones obsoletas
      if (productsToRemove.length > 0) {
        // Buscar los productos por título y obtener sus IDs
        const ids = await Promise.all(
          productsToRemove.map(async (title) => {
            const product = await Product.findOne({ where: { title } });
            return product?.id; // Devuelve el ID del producto si existe
          }),
        );

        // Filtrar IDs válidos (para evitar errores si no se encuentran productos)
        const validIds = ids.filter((id) => id !== null && id !== undefined);

        // Eliminar las relaciones de la tabla intermedia
        await CollectionProduct.destroy({
          where: {
            collectionId,
            productId: validIds, // Busca por los IDs válidos
          },
        });
      }

      return { message: 'The collections actualized succesfully' };
    } catch (error) {
      throw new HttpException('Error updating collection products', 500);
    }
  }

  async deleteCollectionAndRelations(collectionId: string): Promise<void> {
    try {
      // 1. Verificar si la categoría existe
      const category = await Collection.findByPk(collectionId);

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      // 2. Eliminar las relaciones de productos en la tabla ProductCategories
      await CollectionProduct.destroy({
        where: {
          collectionId,
        },
      });

      // 3. Eliminar la categoría
      await category.destroy();
    } catch (error) {
      throw new HttpException('Error deleting category and its relations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOrCreateCollections(title: string, index: number): Promise<string> {
    try {
      const [collection] = await Collection.findOrCreate({ where: { title } });
      return collection.id;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al consultar o crear la collection "${title}" (índice ${index}): ${error.message}`,
      );
    }
  }
}