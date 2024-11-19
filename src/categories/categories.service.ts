import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Categories } from './entity/categories.entity';

@Injectable()
export class CategoriesService {

  async getOrCreateCategory(
    name: string,
    index: number,
  ) {
    try {
      const thisResult: [Categories, boolean] = await Categories.findOrCreate({
        where: { name },
      });

      return thisResult[0].id;
    } catch (error) {
      switch (error.constructor) {
        case NotFoundException:
          throw new NotFoundException(error.message);
        default:
          throw new InternalServerErrorException(
            `Ocurrio un error al consultar la entidad ${Categories.tableName}, con el indice ${index}. Error: ` +
            error.message,
          );
      }
    }
  }

  async getAll() {
    try {
      const allCategories = await Categories.findAll();

      return allCategories;
    } catch (error) {
      throw new HttpException('Error to get categories', 500);
    }
  }
}
