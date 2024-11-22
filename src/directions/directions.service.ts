import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { CreateDirectionDto } from './dto/create-direetion.dto';
import { UpdateDirectionDto } from './dto/update-direetion.dto';
import { IResDirection } from './interfaces/direction.interface';
import { Direction } from './entity/directions.entity';
import { Order } from 'src/orders/entity/order.entity';

@Injectable()
export class DirectionsService {

  async create(
    createDirectionDto: CreateDirectionDto,
    userId: string,
  ): Promise<IResDirection> {
    try {
      const newDirection = await Direction.create({
        ...createDirectionDto,
        userId,
      });

      return {
        status: HttpStatus.CREATED,
        direction: newDirection,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Cannot create address');
      }
      throw new InternalServerErrorException(
        `Internal server error: ${error.message}`,
      );
    }
  }


  async findAll(userId: string): Promise<IResDirection> {
    try {
      const direction = await Direction.findAll({
        where: {
          userId,
        },
      });

      if (direction.length) {
        return {
          status: 200,
          direction,
        };
      } else {
        return {
          status: 204,
          message: 'Does not have any address uploaded yet.',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Server error when querying user addresses',
      );
    }
  }

  async update(
    {
      id,
      address,
      city,
      district,
      country,
      addressReference,
      neighborhood,
      phone,
    }: UpdateDirectionDto,
    userId: string,
  ): Promise<IResDirection> {
    try {
      const thisDirection = await Direction.findByPk(id);

      if (!address && !city && !district && !country && !addressReference && !neighborhood && !phone) {
        return {
          status: HttpStatus.NOT_MODIFIED,
          message: 'No data received to update.',
        };
      }

      thisDirection.address = address ?? thisDirection.address;
      thisDirection.city = city ?? thisDirection.city;
      thisDirection.district = district ?? thisDirection.district;
      thisDirection.country = country ?? thisDirection.country;
      thisDirection.addressReference = addressReference ?? thisDirection.addressReference;
      thisDirection.neighborhood = neighborhood ?? thisDirection.neighborhood;
      thisDirection.phone = phone ?? thisDirection.phone;

      await thisDirection.save();

      if (thisDirection) {
        return {
          status: 200,
          message: 'Your address has been successfully updated.',
          direction: thisDirection,
        };
      } else {
        throw new NotFoundException('Address not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(
          'A server error occurred while trying to update your address',
        );
      }
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Verificar si existen órdenes asociadas a la dirección
      const ordersCount = await Order.count({ where: { directionId: id } });

      if (ordersCount > 0) {
        // Si hay órdenes asociadas, quitar la relación con el usuario
        await Direction.update({ userId: null }, { where: { id, userId } });
        return {
          status: 200,
          message: 'Address successfully desactivated',
        };
      }

      // Si no hay órdenes asociadas, eliminar la dirección
      const toRemoveDirection = await Direction.destroy({
        where: { id, userId },
        force: true,
      });

      const allDirections = await Direction.findAll({ where: { userId } });

      if (toRemoveDirection) {
        return {
          status: 204,
          message: 'Address successfully deleted',
          directions: allDirections,
        };
      } else {
        throw new NotFoundException('Address not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }
}