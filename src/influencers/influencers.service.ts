import { Influencer } from './entity/influencers.entity';
import { Product } from 'src/products/entity/products.entity';
import { Op } from 'sequelize';
import { HttpException, NotFoundException } from '@nestjs/common';

export class InfluencerService {
  async createInfluencerWithProducts(dto: any) {
    try {
      const { products, ...influencerData } = dto;
      console.log(influencerData);

      const influencer = await Influencer.create(influencerData);

      if (products?.length) {
        await Product.update(
          { influencer_id: influencer.id },
          { where: { title: products } },
        );
      }

      return influencer;
    } catch (error) {
      throw new HttpException('Error creating influencer', 500);
    }
  }

  async updateInfluencerWithProducts(id: string, dto: any) {
    try {
      const { products, ...influencerData } = dto;

      const influencer = await Influencer.findByPk(id);
      if (!influencer) throw new HttpException('Influencer not found', 404);

      await influencer.update(influencerData);

      if (products?.length) {
        await Product.update(
          { influencer_id: id },
          { where: { title: products } },
        );

        await Product.update(
          { influencer_id: null },
          {
            where: {
              influencer_id: id,
              title: { [Op.notIn]: products },
            },
          },
        );
      } else {
        await Product.update(
          { influencer_id: null },
          { where: { influencer_id: id } },
        );
      }

      return influencer;
    } catch (error) {
      throw new HttpException('Error updating influencer', 500);
    }
  }

  async getAllInfluencers() {
    try {
      return await Influencer.findAll({
        include: { model: Product },
      });
    } catch (error) {
      throw new HttpException('Error fetching influencers', 500);
    }
  }

  async getInfluencerById(id: string) {
    try {
      let influencer = {};

      if (id !== 'create') {
        influencer = await Influencer.findByPk(id, {
          include: {
            model: Product,
            attributes: ['images', 'title', 'price'],
          },
        });
      }

      if (!influencer) {
        throw new HttpException('Influencer not found', 404);
      }

      const availableProducts = await Product.findAll();

      return { influencer, availableProducts: availableProducts };
    } catch (error) {
      throw new HttpException('Error fetching influencer', 500);
    }
  }

  async deleteInfluencer(id: string) {
    try {
      await Product.update(
        { influencer_id: null },
        { where: { influencer_id: id } },
      );

      const deleted = await Influencer.destroy({ where: { id } });
      if (!deleted) throw new HttpException('Influencer not found', 404);

      return { message: 'Influencer deleted and products desvinculated' };
    } catch (error) {
      throw new HttpException('Error deleting influencer', 500);
    }
  }

  async getAllAdmin(page: number, limit: number, search?: string) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = {};

      if (search) {
        whereClause = {
          name: { [Op.iLike]: `%${search}%` },
        };
      }

      const total = await Influencer.count({ where: whereClause });

      const influencers = await Influencer.findAll({
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
        influencers,
      };
    } catch (error) {
      throw new HttpException('Error getting influencers', 500);
    }
  }

  async getInfluencerStore(label: string) {
    try {
      const influencer = await Influencer.findOne({
        where: { label },
        include: [Product],
      });

      const influencers = await Influencer.findAll({
        attributes: ['label'],
        where: {
          label: {
            [Op.ne]: label, // label !== X
          },
        },
      });

      if (!influencer) throw new NotFoundException('Influencer not found');

      return { influencer, influencersLabel: influencers.map((i) => i.label) };
    } catch (error) {
      console.log(error.message);
      throw new HttpException('Error getting influencers', 500);
    }
  }
}
