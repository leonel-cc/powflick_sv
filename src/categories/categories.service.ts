import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Categories } from './entity/categories.entity';
import { Op } from 'sequelize';
import { Product } from '../products/entity/products.entity';
import { ProductCategories } from './entity/productcategories.entity';
import { deleteIfNoRelations } from 'src/utils/hooks';

@Injectable()
export class CategoriesService {

  async getOrCreateCategory(name: string, index: number): Promise<string> {
    try {
      const [category] = await Categories.findOrCreate({ where: { name } });
      return category.id;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al consultar o crear la categoría "${name}" (índice ${index}): ${error.message}`,
      );
    }
  }

  async getAllTitles() {
    try {
      const allCategories = await Categories.findAll();

      return allCategories.map((c) => { return { title: c.name }; });
    } catch (error) {
      throw new HttpException('Error to get categories', 500);
    }
  }

  async getAllAdmin(page: number, limit: number, search?: string) {
    try {
      const offset = (page - 1) * limit;

      // Configurar el filtro de búsqueda
      let whereClause = null;
      if (search) whereClause = { name: { [Op.iLike]: `%${search}%` } }; // Usando operadores de Sequelize

      // Obtener el total de categorías
      const total = await Categories.count({ where: whereClause });

      // Obtener las categorías paginadas
      const allCategories = await Categories.findAll({
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
        categories: allCategories.map((category) => ({
          id: category.id,
          name: category.name,
          products: category.products,
        })),
      };
    } catch (error) {
      throw new HttpException('Error to get categories', 500);
    }
  }

  async getCategoryWithProducts(categoryId: string) {
    try {
      let category = {};
      if (categoryId !== 'create') {
        category = await Categories.findByPk(categoryId, {
          include: { model: Product },  // Incluye los productos asociados
        });

        if (!category) {
          throw new HttpException('Category not found', 404);
        }
      }

      const availableProducts = await Product.findAll({
        attributes: ['title'], // Solo traer el campo 'title'
      });

      return { category, availableProducts: availableProducts.map(p => p.title) };
    } catch (error) {
      throw new HttpException('Error fetching category with products', 500);
    }
  }

  async createCategoryWithProducts(
    categoryName: string,
    productTitle: string[],
  ) {
    try {
      const formattedName =
      categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();

      // 1. Crear la categoría
      const category = await Categories.create({ name: formattedName });
      // 2. Buscar los productos por título y obtener sus IDs
      if (productTitle.length > 0) {
        const ids = await Promise.all(
          productTitle.map(async (title) => {
            const product = await Product.findOne({ where: { title } });
            return product?.id; // Devuelve el ID del producto si existe
          }),
        );

        // Filtrar IDs nulos o indefinidos (por si algún título no tiene producto asociado)
        const validIds = ids.filter((id) => id !== null && id !== undefined);

        // 3. Crear relaciones en la tabla intermedia
        if (validIds.length > 0) {
          await ProductCategories.bulkCreate(
            validIds.map((productId) => ({
              categoryId: category.id,
              productId,
            })),
          );
        }
      }

      return category;
    } catch (error) {
      throw new HttpException('Error creating category with products', 500);
    }
  }

  async updateCategoryProducts(
    categoryId: string,
    productTitle: string[],
    newCategoryName?: string, // Nuevo parámetro opcional para el nombre de la categoría
  ): Promise<void> {
    try {
      // 1. Verifica si la categoría existe
      const category = await Categories.findByPk(categoryId, {
        include: { model: Product },
      });

      if (!category) {
        throw new HttpException('Category not found', 404);
      }

      // 2. Actualizar el nombre de la categoría si se proporcionó
      if (newCategoryName && newCategoryName !== category.name) {
        category.name = newCategoryName;
        await category.save();
      }

      // 3. Obtener los productos actualmente relacionados
      const currentProductTitle = category.products.map((product) => product.title);

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
        await ProductCategories.bulkCreate(
          validIds.map((productId) => ({
            categoryId,
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
        await ProductCategories.destroy({
          where: {
            categoryId,
            productId: validIds, // Busca por los IDs válidos
          },
        });
      }
    } catch (error) {
      throw new HttpException('Error updating category products', 500);
    }
  }

  async deleteCategoryAndRelations(categoryId: string): Promise<void> {
    try {
      // 1. Verificar si la categoría existe
      const category = await Categories.findByPk(categoryId);

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      // 2. Eliminar las relaciones de productos en la tabla ProductCategories
      await ProductCategories.destroy({
        where: {
          categoryId,
        },
      });

      // 3. Eliminar la categoría
      await category.destroy();
    } catch (error) {
      throw new HttpException('Error deleting category and its relations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteRelationsWithProductId(productId: string): Promise<void> {
    const relations = await ProductCategories.findAll({ where: { productId } });
    await ProductCategories.destroy({ where: { productId } });

    for (const rel of relations) {
      const category = await Categories.findByPk(rel.categoryId);
      if (category) {
        await deleteIfNoRelations(category, 'products');
      }
    }
  }
}