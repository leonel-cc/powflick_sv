import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindOptions, Op, OrderItem, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ICreateUser } from './interfaces/user.interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { User, UserProviders } from './entity/users.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Customization } from '../products/entity/customization.entity';
import { Product } from '../products/entity/products.entity';
import { Cases } from '../mail/dto/sendMail.dto';
import { ICreateUserContext } from '../mail/interfaces/create-account-context.interface';
import { MailService } from '../mail/mail.service';
import { ShoppingCart } from '../shopping-cart/entity/shopping-cart.entity';
import { Order } from '../orders/entity/order.entity';
import { Sport } from '../sport/entity/sport.entity';
import { Direction } from '../directions/entity/directions.entity';
import { Review } from '../reviews/entity/reviews.entity';
import { HttpStatusCode } from 'axios';
import { UserProductFav } from './entity/userproductfav.entity';
import { Messages } from '../messages/entity/messages.entity';
import { de } from '@faker-js/faker';
import { Coupon } from 'src/coupon/entities/coupon.entity';
import { CouponUser } from 'src/coupon/entities/coupon-user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly mailsService: MailService,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ICreateUser> {
    try {
      let data;

      if (createUserDto.password) {
        data = {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          password: await this.authService.generatePassword(
            createUserDto.password,
          ),
          phone: createUserDto.phone,
          image: createUserDto.image ?? null,
        };
      } else {
        data = {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          provider: createUserDto.provider,
          image: createUserDto.image ?? null,
          password: '',
          phone: '',
        };
      }

      const newUser = await User.create(data);

      const response = {
        statusCode: 201,
        token: await this.authService.generateToken(
          newUser.id,
          newUser.email,
          newUser.rol,
        ),
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.firstName + ' ' + newUser.lastName,
        },
      };

      //Setting up for email sending
      const context: ICreateUserContext = {
        firstname: createUserDto.firstName,
        lastname: createUserDto.lastName,
        /* link: 'http://TheSports.com', //Link falso. Reemplazar por link de verdad */
      };

      const mailData = {
        EmailAddress: createUserDto.email,
        subject: Cases.CREATE_ACCOUNT,
        context: context,
      };
      //Sending mail
      await this.mailsService.sendMails(mailData);

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, try again later \n' + error.message,
      );
    }
  }

  async verifyEmail(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return true;
      } else {
        throw new ConflictException(
          'There is already an account created with this email.',
        );
      }
    } catch (error) {
      switch (error.constructor) {
        case ConflictException:
          throw new ConflictException(error.message);
        default:
          throw new InternalServerErrorException(
            'Internal server error, try again later',
          );
      }
    }
  }

  async signIn(loginUserDto: LoginUserDto): Promise<ICreateUser> {
    try {
      const { email, password } = loginUserDto;

      const checkUser = await this.findOneByEmail(email);

      const comparePassword = password
        ? await this.authService.comparePassword(password, checkUser.password)
        : null;

      if (!checkUser.isActive)
        throw new ForbiddenException(
          'You do not have access, check with the administration',
        );

      if (password && !comparePassword) {
        if (checkUser.provider === UserProviders.none) {
          throw new UnauthorizedException(
            'The password entered is not valid, check and try again',
          );
        } else {
          throw new HttpException(
            'This account has been registered with' +
              checkUser.provider +
              ', please use ' +
              checkUser.provider +
              ' to log in.',
            HttpStatus.NOT_ACCEPTABLE,
          );
        }
      }

      // Generar el token y obtener la fecha de expiración
      const token = await this.authService.generateToken(
        checkUser.id,
        checkUser.email,
        checkUser.rol,
      );
      const tokenExpiration = this.authService.getTokenExpirationDate(token);

      const response = {
        statusCode: 200,
        token,
        tokenExpiration, // Enviar la fecha de expiración junto con el token
        user: {
          id: checkUser.id,
          email: checkUser.email,
          name: checkUser.firstName + ' ' + checkUser.lastName,
          rol: checkUser.rol,
        },
      };

      return response;
    } catch (error) {
      switch (error.constructor) {
        case UnauthorizedException:
          throw new UnauthorizedException(error.message);
        default:
          throw new HttpException(error.message, error.status);
      }
    }
  }

  public async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await User.findOne({ where: { email } });

      if (user) {
        return user;
      } else {
        throw new UnauthorizedException(
          'The email entered does not correspond to any registered user.',
        );
      }
    } catch (error) {
      switch (error.constructor) {
        case UnauthorizedException:
          throw new UnauthorizedException(error.message);
        default:
          throw new InternalServerErrorException('Error interno del servidor.');
      }
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Asigna las propiedades definidas en updateUserDto al usuario
      for (const prop in updateUserDto) {
        if (updateUserDto[prop] !== undefined) {
          user[prop] = updateUserDto[prop];
        }
      }

      await user.save();

      return {
        status: 204,
        message: 'Successfully updated user',
        profileUpdated: user,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Server error, try again later' + error.message,
      );
    }
  }

  public async findByPkGenericUser(
    userId: string,
    options: FindOptions,
  ): Promise<User> {
    try {
      const genericResponseUser = await User.findByPk(userId, options);
      if (!genericResponseUser)
        throw new BadRequestException(
          'It has not been possible to find the user',
        );
      return genericResponseUser;
    } catch (error) {
      switch (error.constructor) {
        case BadRequestException:
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException(
            'An error occurred when working with the user entity when searching for a particular user',
          );
      }
    }
  }

  async findProfileUser(userId: string) {
    try {
      const genericResponseUser = await User.findByPk(userId, {
        attributes: ['firstName', 'lastName', 'email', 'phone', 'image'],
        include: [
          {
            model: CouponUser,
            attributes: ['id', 'active'],
            include: [
              {
                model: Coupon,
                attributes: ['id', 'title', 'content', 'discount'],
              },
            ],
          },
          {
            model: Customization,
            include: [
              {
                model: Product,
                attributes: ['id', 'title'],
              },
            ],
          },
          {
            model: ShoppingCart,
            attributes: ['id'],

            include: [
              {
                model: Product,
                attributes: ['id', 'title', 'price', 'images'],
                include: [{ model: Sport }],
                through: { attributes: ['id', 'amount'] },
              },
            ],
          },
          {
            model: Order,
            attributes: [
              'id',
              'total',
              'currency',
              'state',
              'customizations',
              'coupon',
              'createdAt',
              'updatedAt',
            ],
            order: [['id', 'DESC']],
            include: [
              {
                model: Direction,
                attributes: [
                  'id',
                  'country',
                  'city',
                  'district',
                  'address',
                  'postalCode',
                  'addressReference',
                  'neighborhood',
                  'phone',
                ],
              },
              {
                model: Product,
                attributes: [
                  'id',
                  'title',
                  'price',
                  'images',
                  'short_description',
                  'sports',
                ],
              },
            ],

            /* a agregar una vez se hayan hecho las uniones respectivas con Payment entiti */
          },
          {
            model: Review,
            attributes: ['id', 'review', 'rating'],
          },
          {
            model: Direction,
            attributes: [
              'id',
              'city',
              'country',
              'district',
              'address',
              'addressReference',
              'neighborhood',
              'phone',
            ],
          },
        ],
      });

      const favorites = await UserProductFav.findAll({
        where: { userId },
        attributes: ['id'],
        include: {
          model: Product,
          attributes: ['id', 'title', 'price', 'sports', 'images'],
        },
      });

      const messages = await Messages.findAll({
        where: { email: genericResponseUser.email },
      });

      if (!genericResponseUser)
        throw new BadRequestException(
          'It has not been possible to find the user',
        );
      return { genericResponseUser, favorites, messages };
    } catch (error) {
      switch (error.constructor) {
        case BadRequestException:
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException(
            'An error occurred while working with the User entity when investigating the user profile.\n' +
              error.message,
          );
      }
    }
  }

  async getAll(
    page: number,
    limit: number,
    order: string,
    isActive: string | null = null,
    role: string | null = null,
    filter: string | null = null,
    search: string | null = null,
  ) {
    try {
      page--; // Ajusta a 0-indexado

      let orderClause: OrderItem[] = [];
      let where: WhereOptions = {};
      // Busca el valor sobre el atributo filtrado
      if (filter && search) where = { [filter]: { [Op.iLike]: `%${search}%` } };
      // Ordena sobre el atributo filtrado, al no mandar ningún filtro, ordena por orden de creación
      if (order) {
        const columnToOrder = filter || 'createdAt';
        orderClause = [[columnToOrder, order]] as OrderItem[];
      }
      if (isActive && isActive !== 'all') {
        where = { ...where, isActive: isActive === 'active' ? true : false };
      }
      if (role && role !== 'all') {
        where = { ...where, rol: role };
      }

      const { rows: users, count: total } = await User.findAndCountAll({
        where,
        limit,
        offset: page * limit, // Calcula el offset correctamente
        order: orderClause,
        attributes: { exclude: ['password'] },
      });

      const limitOfPages = Math.ceil(total / limit);

      if (page < 0 || page >= limitOfPages) {
        // throw new HttpException('This page does not exist.', 400);
      }
      const totalPages = Math.ceil(total / Number(limit));
      return {
        prevPage: page === 0 ? null : page,
        page: page + 1,
        nextPage: page === limitOfPages - 1 ? null : page + 2,
        totalPages,
        total,
        users,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async deleteUser(id: string): Promise<any> {
    try {
      const user = await User.findByPk(id);
      user.isActive = !user.isActive;

      if (!user.isActive) {
        /* Realiza la eliminación del carrito de compras dentro de la transacción. */
        await ShoppingCart.destroy({ where: { userId: id } });
        return {
          message: `The User's account was inactivated: ${
            user.firstName + ' ' + user.lastName
          } correctly.`,
          status: HttpStatusCode.NoContent,
        };
      } else {
        /* Realiza la creación del carrito de compras dentro de la transacción. */
        await ShoppingCart.create({ userId: id });
        return {
          message: `The Users account has been restored ${
            user.firstName + ' ' + user.lastName
          } correctly.`,
          status: HttpStatusCode.Ok,
        };
      }
    } catch (error) {
      throw new HttpException(
        'Error changing user status.\nTry again later.',
        404,
      );
    }
  }
}
