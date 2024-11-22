import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Sport } from './entity/sport.entity';

@Injectable()
export class SportService {

  async getOrCreateSport(name: string, index: number): Promise<string> {
    try {
      const [sport] = await Sport.findOrCreate({
        where: { name },
      });

      return sport.id; // Retorna solo el ID del deporte
    } catch (error) {
      throw new InternalServerErrorException(
        `An error occurred while querying the entity "${Sport.tableName}" at index ${index}. Error: ${error.message || 'Unknown error'}`,
      );
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
