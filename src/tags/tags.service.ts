import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Tags } from './entity/tags.entity';
import { Product } from 'src/products/entity/products.entity';
import { Op } from 'sequelize';
import { ProductTags } from './entity/productTags.entity';
import { deleteIfNoRelations } from '../utils/hooks';
import { capitalizeTitle } from 'src/utils/tools';

@Injectable()
export class TagsService {

  async findAll(): Promise<Tags[]> {
    const tags = await Tags.findAll({
      include: [
        {
          model: Product,
        },
      ],
    });

    // Añadir la cantidad de productos asociados a cada colección
    tags.forEach(tag => {
      (tag as any).productCount = tag.products.length;
    });

    return tags;
  }

  async findOne(tagId: string) {
    let tag = {};
    if (tagId !== 'create') {
      tag = await Tags.findByPk(tagId, {
        include: { model: Product },  // Incluye los productos asociados
      });

      if (!tag) {
        throw new HttpException('Tag not found', 404);
      }
    }

    const availableProducts = await Product.findAll({
      attributes: ['title'], // Solo traer el campo 'title'
    });

    return { tag, availableProducts: availableProducts.map(p => p.title) };
  }


  async getOrCreateTags(name: string, index: number): Promise<string> {
    try {
      const [tag] = await Tags.findOrCreate({ where: { name } });
      return tag.id;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al consultar o crear el tag "${name}" (índice ${index}): ${error.message}`,
      );
    }
  }

  async getAllAdmin(page: number, limit: number, search?: string) {
    try {
      const offset = (page - 1) * limit;

      // Configurar el filtro de búsqueda
      let whereClause = null;
      if (search) whereClause = { name: { [Op.iLike]: `%${search}%` } }; // Usando operadores de Sequelize

      // Obtener el total de tags
      const total = await Tags.count({ where: whereClause });

      // Obtener las tags paginadas
      const allTags = await Tags.findAll({
        where: whereClause,
        include: [Product],
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
        tags: allTags,
      };
    } catch (error) {
      throw new HttpException('Error to get tags', 500);
    }
  }

  async createTagWithProducts(tagDto: any) {
    try {
      const { products, ...t } = tagDto;

      const capitalizedName = capitalizeTitle(t.name); // Formatear el nombre del tag

      // 1. Crear o encontrar la etiqueta
      const [tag] = await Tags.findOrCreate({ where: { name: capitalizedName } });

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

        // 3. Crear relaciones en la tabla intermedia solo si no existen
        if (validIds.length > 0) {
          const existingRelationships = await ProductTags.findAll({
            where: {
              tagId: tag.id,
              productId: validIds,
            },
          });

          const existingProductIds = existingRelationships.map((rel) => rel.productId);

          // Filtrar los productos que aún no están relacionados con esta etiqueta
          const newProductIds = validIds.filter((id) => !existingProductIds.includes(id));

          // Si hay productos nuevos, crear las relaciones
          if (newProductIds.length > 0) {
            await ProductTags.bulkCreate(
              newProductIds.map((productId) => ({
                tagId: tag.id,
                productId,
              })),
            );
          }
        }
      }

      return tag;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error creating category with products', 500);
    }
  }

  async updateTagProducts(
    tagId: string,
    productTitle: string[],
    tagDto?: any, // Nuevo parámetro opcional para el nombre del tag
  ) {
    try {
      // 1. Verifica si el tag existe
      const tag = await Tags.findByPk(tagId, {
        include: { model: Product },
      });

      if (!tag) {
        throw new HttpException('tag not found', 404);
      }

      tag.name = tagDto.title ?? tag.name;

      await tag.save();

      // 2. Obtener los productos actualmente relacionados
      const currentProductTitle = tag.products.map((product) => product.title);

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
        await ProductTags.bulkCreate(
          validIds.map((productId) => ({
            tagId,
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
        await ProductTags.destroy({
          where: {
            tagId,
            productId: validIds, // Busca por los IDs válidos
          },
        });
      }

      return { message: 'The tag actualized succesfully' };
    } catch (error) {
      throw new HttpException('Error updating tags products', 500);
    }
  }

  async deleteTagAndRelations(tagId: string): Promise<void> {
    try {
      // 1. Verificar si el tag existe
      const tag = await Tags.findByPk(tagId);

      if (!tag) {
        throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
      }

      // 2. Eliminar las relaciones de productos en la tabla ProductTags
      await ProductTags.destroy({
        where: {
          tagId,
        },
      });

      // 3. Eliminar el tag
      await tag.destroy();
    } catch (error) {
      throw new HttpException('Error deleting category and its relations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteRelationsWithProductId(productId: string): Promise<void> {
    const relations = await ProductTags.findAll({ where: { productId } });
    await ProductTags.destroy({ where: { productId } });

    for (const rel of relations) {
      const tag = await Tags.findByPk(rel.tagId);
      if (tag) {
        await deleteIfNoRelations(tag, 'products');
      }
    }
  }
}
