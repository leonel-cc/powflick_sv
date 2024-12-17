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
import { Coupon } from '../coupon/entities/coupon.entity';
import { CouponUser } from '../coupon/entities/coupon-user.entity';
import { Conversation } from '../messages/entity/conversationMessage';

@Injectable()
export class UsersService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly mailsService: MailService,
    private authService: AuthService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<ICreateUser> {
    try {
      const { firstName, lastName, email, password, phone, image, provider } = createUserDto;

      const userData = {
        firstName,
        lastName,
        email,
        phone,
        image: image ?? null,
        password: password ? await this.authService.generatePassword(password) : '',
        provider: provider || UserProviders.none,
      };

      const newUser = await User.create(userData);

      // Generar el token
      const token = await this.authService.generateToken(newUser.id, newUser.email, newUser.rol);

      // Enviar correo de confirmación
      await this.mailsService.sendMails({
        EmailAddress: email,
        subject: Cases.CREATE_ACCOUNT,
        context: { firstname: firstName, lastname: lastName },
      });

      return {
        statusCode: 201,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: `${newUser.firstName} ${newUser.lastName}`,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Internal server error, try again later \n ${error.message}`,
      );
    }
  }

  async verifyEmail(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ where: { email } });

      if (user) {
        throw new ConflictException('An account with this email already exists.');
      }
      return true;
    } catch (error) {
      throw error instanceof ConflictException
        ? error
        : new InternalServerErrorException('Internal server error, try again later');
    }
  }

  async signIn(loginUserDto: LoginUserDto): Promise<ICreateUser> {
    try {
      const { email, password } = loginUserDto;
      const checkUser = await this.findOneByEmail(email);

      if (!checkUser.isActive) {
        throw new ForbiddenException('Your account is inactive.');
      }

      // Si no se pasa password o no coincide, gestionar el flujo
      if (password && !(await this.authService.comparePassword(password, checkUser.password))) {
        const errorMessage = checkUser.provider === UserProviders.none
          ? 'Invalid password, please try again.'
          : `This account was registered with ${checkUser.provider}. Please use ${checkUser.provider} to log in.`;

        throw new UnauthorizedException(errorMessage);
      }

      // Generar el token y fecha de expiración
      const token = await this.authService.generateToken(checkUser.id, checkUser.email, checkUser.rol);
      const tokenExpiration = this.authService.getTokenExpirationDate(token);

      return {
        statusCode: 200,
        token,
        tokenExpiration,
        user: {
          id: checkUser.id,
          email: checkUser.email,
          name: `${checkUser.firstName} ${checkUser.lastName}`,
          rol: checkUser.rol,
        },
      };
    } catch (error) {
      throw error instanceof UnauthorizedException
        ? error
        : new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  public async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new UnauthorizedException('The email entered does not correspond to any registered user.');
      }

      return user;
    } catch (error) {
      // Si el error no es UnauthorizedException, lanza un InternalServerErrorException
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException('Internal server error.');
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
      // Se agrega el detalle del error para mejor diagnóstico
      throw new InternalServerErrorException(
        `Server error, try again later. Error: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  public async findByPkGenericUser(
    userId: string,
    options: FindOptions,
  ): Promise<User> {
    try {
      const user = await User.findByPk(userId, options);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error searching user with ID: ${userId}. ${error.message}`,
      );
    }
  }


  async findProfileUser(userId: string) {
    try {
      const genericResponseUser = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'image'],
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
        include: {
          model: Conversation,
          attributes: ['name', 'text', 'imgUrl', 'createdAt', 'from'],
        },
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
          message: `The User's account was inactivated: ${user.firstName + ' ' + user.lastName
          } correctly.`,
          status: HttpStatusCode.NoContent,
        };
      } else {
        /* Realiza la creación del carrito de compras dentro de la transacción. */
        await ShoppingCart.create({ userId: id });
        return {
          message: `The Users account has been restored ${user.firstName + ' ' + user.lastName
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
