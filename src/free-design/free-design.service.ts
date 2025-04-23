import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateFreeDesignDto } from './dto/create-free-design.dto';
import { Op } from 'sequelize';
import { FreeDesign } from './entity/free-design.entity';

@Injectable()
export class FreeDesignService {

  async create(dto: CreateFreeDesignDto) {
    try {
      const freeDesign = await FreeDesign.create({ ...dto });

      return {
        message: 'Free design created successfully',
        freeDesign,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(
    order: string,
    limit: number,
    page: number,
    filter?: string,
    search?: string,
  ) {
    try {
      let where: any = {};
      let orderClause: any[] = [];

      if (filter && search) {
        where = { [filter]: { [Op.iLike]: `%${search}%` } };
      } else if (search) {
        where = {
          [Op.or]: [
            { fullName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        };
      }

      if (order) {
        const column = filter || 'createdAt';
        orderClause = [[column, order]];
      }

      const total = await FreeDesign.count({ where });
      const totalPages = Math.ceil(total / limit);

      const results = await FreeDesign.findAll({
        where,
        order: orderClause,
        limit,
        offset: (page - 1) * limit,
      });

      return {
        prevPage: page === 1 ? null : page - 1,
        page,
        nextPage: page === totalPages ? null : page + 1,
        totalPages,
        total,
        results,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
