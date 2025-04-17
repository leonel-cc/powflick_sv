import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Coupon } from './entities/coupon.entity';
import { CouponUser } from './entities/coupon-user.entity';
import { CreateCouponUserDto } from './dto/create-coupon-user.dto';
import { WhereOptions } from 'sequelize';
import { User } from '../users/entity/users.entity';
import { validate } from 'class-validator';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon)
    private couponModel: typeof Coupon,
    @InjectModel(CouponUser)
    private couponUserModel: typeof CouponUser,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    // Validar la entrada
    const errors = await validate(createCouponDto);
    if (errors.length > 0) {
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verificar si ya existe un cupón con el mismo criterio único (ejemplo: título)
    const existingCoupon = await this.couponModel.findOne({
      where: { title: createCouponDto.title }, // Asumiendo que 'title' es el campo único
    });
    if (existingCoupon) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Coupon with the same title already exists',
        coupon: existingCoupon,
      };
    }

    try {
      const coupon = new this.couponModel(createCouponDto);
      const savedCoupon = await coupon.save();

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Coupon created successfully',
        coupon: savedCoupon,
      };
    } catch (error) {
      // Manejar errores específicos de la base de datos, por ejemplo, violación de clave única
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new HttpException('Coupon already exists', HttpStatus.CONFLICT);
      }
      // Para otros errores no capturados específicamente, devolver un error genérico
      throw new HttpException(
        'Failed to create coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return this.couponModel.findAll();
  }

  async findOne(id: string) {
    return this.couponModel.findByPk(id);
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    if (coupon) {
      await coupon.update(updateCouponDto);
      return coupon;
    }
    return null;
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);
    if (coupon) {
      await coupon.destroy();
      return { message: 'Coupon deleted successfully.' };
    }
    return null;
  }

  //coupon-users
  async createCouponUsers(
    createCouponUserDto: CreateCouponUserDto,
    userId: string,
    titleQuery: string,
  ) {
    try {
      // Verificar la existencia del cupón
      const coupon = await this.couponModel.findOne({
        where: { title: titleQuery } as WhereOptions<Coupon>,
      });
      if (!coupon) {
        return { message: 'Coupon not found.' };
      }

      // Verificar la existencia del usuario
      const userExists = await this.userModel.findByPk(userId);
      if (!userExists) {
        return { message: 'User not found.' };
      }

      // Verificar si el usuario ya tiene el cupón vinculado por nombre
      const existingCouponUser = await this.couponUserModel.findOne({
        include: [
          {
            model: this.couponModel,
            where: { title: titleQuery },
            required: true,
          },
        ],
        where: { userId: userId },
      });

      console.log(!!existingCouponUser);

      if (!!existingCouponUser) {
        throw new HttpException(
          'User already has this coupon.',
          HttpStatus.NOT_MODIFIED,
        );
      }

      // Crear CouponUser
      const couponUser = new this.couponUserModel({
        userId: userId,
        couponId: coupon.id,
        active: true,
      });
      await couponUser.save();

      return {
        statusCode: HttpStatus.CREATED,
        message: 'CouponUser created successfully.',
        couponUser,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllCouponUsers() {
    try {
      return await this.couponUserModel.findAll({
        where: { active: true },
      });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findCouponUserById(id: string) {
    return this.couponUserModel.findByPk(id);
  }

  async updateCouponUser(id: string, createCouponUserDto: CreateCouponUserDto) {
    const couponUser = await this.findCouponUserById(id);
    if (couponUser) {
      await couponUser.update(createCouponUserDto);
      return couponUser;
    }
    return null;
  }

  async removeCouponUser(id: string) {
    const couponUser = await this.findCouponUserById(id);
    if (couponUser) {
      await couponUser.destroy();
      return { message: 'CouponUser deleted successfully.' };
    }
    return null;
  }

  async findCouponUserByUserId(userId: string) {
    try {
      return await this.couponUserModel.findAll({
        where: { userId, active: true },
        include: [
          {
            model: this.couponModel,
            attributes: ['title', 'content', 'discount'],
          },
        ],
      });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOneCouponUserByCouponIdandUserId(userId: string, couponId: string) {
    try {
      return await this.couponUserModel.findOne({
        where: { userId, couponId, active: true },
        include: [
          {
            model: this.couponModel,
            attributes: ['title', 'content', 'discount'],
          },
        ],
      });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
