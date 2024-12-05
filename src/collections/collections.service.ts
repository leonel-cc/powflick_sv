import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: string): Promise<Collection> {
    const collection = await Collection.findByPk(id, {
      include: [
        {
          model: Product,
          through: { attributes: [] }, // Include products through CollectionProduct
        },
      ],
    });
    if (!collection) {
      throw new NotFoundException(`Collection with id ${id} not found`);
    }
    return collection;
  }

  async update(id: string, updateCollectionDto: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.findOne(id);
    collection.title = updateCollectionDto.title ?? collection.title;
    collection.content = updateCollectionDto.content ?? collection.content;
    await collection.save();

    return collection;
  }

  async remove(id: string): Promise<void> {
    const collection = await this.findOne(id);
    await collection.destroy();
  }

  async createCollectionWithProducts(): Promise<string> {
    // Obtener todos los productos
    const products = await Product.findAll();
    console.log('Productos encontrados:', products);

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
      console.log('Colección creada:', collection);

      // Encontrar todos los productos relacionados que contienen la palabra clave en el título
      const relatedProducts = await Product.findAll({
        where: {
          title: {
            [Op.like]: `%${keyword}%`,
          },
        },
      });
      console.log(`Productos relacionados con "${keyword}":`, relatedProducts);

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
}