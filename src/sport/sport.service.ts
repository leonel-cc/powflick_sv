import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Sport } from './entity/sport.entity';

@Injectable()
export class SportService {

  async getOrCreateSport(
    name: string,
    index: number,
  ) {
    try {
      const thisResult: [Sport, boolean] = await Sport.findOrCreate({
        where: { name },
      });

      return thisResult[0].id;
    } catch (error) {
      switch (error.constructor) {
        case NotFoundException:
          throw new NotFoundException(error.message);
        default:
          throw new InternalServerErrorException(
            `An error occurred while querying the entity ${Sport.tableName}, with the index ${index}. Error: ` +
                error.message,
          );
      }
    }
  }

  async getAll() {
    try {
      const allSport = await Sport.findAll();

      const sportsWithMaterials = allSport.map((sport) => ({
        ...sport.toJSON(),
        materials: sport.getMaterials(),
      }));

      console.log(sportsWithMaterials);

      return sportsWithMaterials;
    } catch (error) {
      throw new HttpException('Error getting all sports.', 500);
    }
  }
}
