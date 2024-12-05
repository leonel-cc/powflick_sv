import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Categories } from './entity/categories.entity';

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


  async getAll() {
    try {
      const allCategories = await Categories.findAll();

      return allCategories.map((c) => { return { title: c.name }; });
    } catch (error) {
      throw new HttpException('Error to get categories', 500);
    }
  }
}
