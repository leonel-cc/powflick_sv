import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderStateEnum } from './entity/order.entity';
import { Product } from '../products/entity/products.entity';
import { Direction } from '../directions/entity/directions.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { ShoppingCart } from '../shopping-cart/entity/shopping-cart.entity';
import { UsersService } from '../users/users.service';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { OrderProduct } from './entity/orderProduct.entity';
import { Sequelize } from 'sequelize-typescript';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  IGetOrders,
  IOrder,
  UpdateStateOrder,
} from './interfaces/response-order.interface';
import { GetAllOrdersDto, SearchByEnum } from './dto/getAllOrders.dto';
import { Rol, User } from '../users/entity/users.entity';
import { Response } from '../products/interface/serviceInterfaces';
import Stripe from 'stripe';
import { StripeService } from '../payments/stripe.service';
import { Customization } from '../products/entity/customization.entity';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { CurrencyService } from '../currency/currency.service';
import { currencySymbol, eliminarCaracteresNoNumericos } from '../utils/tools';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class OrdersService {
  constructor(
    private shoppingCartService: ShoppingCartService,
    private paymentsService: StripeService,
    private userService: UsersService,
    private currencyService: CurrencyService,
    private sequelize: Sequelize,
    private couponService: CouponService,
  ) { }

  async findOneOrder(id: string, user: IGetUser) {
    try {
      const order = await Order.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Product,
            attributes: [
              'id',
              'title',
              'short_description',
              'price',
              'images',
              'slug',
              'sports',
            ],
            through: {
              attributes: ['amount', 'price'],
            },
          },
          {
            model: Direction,
          },
          {
            model: User,
          },
        ],
      });

      const directions = await Direction.findAll({ where: { userId: order.userId } });

      if (
        (order && order.userId === user.userId) ||
        (order && user.rol === Rol.admin)
      ) {
        return {
          status: 200,
          data: order,
          directions,
        };
      } else {
        throw new NotFoundException('Order not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found');
      } else {
        throw new InternalServerErrorException('Server error');
      }
    }
  }

  //Crear Orden
  async create(
    data: CreateOrderDto,
    currency: { name: string; value: number },
  ): Promise<object> {
    const transaction: Transaction = await this.sequelize.transaction();

    try {
      const { userId, directionId, couponId } = data;
      //Obtenemos el id del carrito del usuario que realiza la peticion
      const thisUser = await this.userService.findByPkGenericUser(userId, {
        include: [
          {
            model: ShoppingCart,
            attributes: ['id'],
            include: [
              {
                model: Product,
                attributes: ['id', 'stock', 'price', 'images'],
              },
            ],
          },
        ],
        transaction,
      });

      //Aqui obtenemos el monto total y los productos para realizar la orden
      const { total, products } =
        await this.shoppingCartService.getCartProducts(thisUser.cart.id);

      if (products.length === 0)
        throw new HttpException('The cart is empty', 400);

      // Obtenemos el descuento del cupón si existe
      let discountAmount = 0;
      let appliedCoupon = null;
      if (couponId) {
        const coupon = await this.couponService.findOne(couponId);
        if (coupon) {
          // Calculamos el monto del descuento como un porcentaje del total
          discountAmount = (Number(total) * coupon.discount) / 100;
          appliedCoupon = coupon;
        }
      }

      // Aplicamos el descuento al total
      const totalWithDiscount = Number(total) - discountAmount;

      const orderData: {
        total: string;
        currency: { name: string; value: number };
        userId: string;
        directionId: string;
        coupon?: any;
      } = {
        total: this.currencyService.convertCurrency(
          Number(totalWithDiscount),
          currency.value,
        ),
        currency: { name: currency.name, value: currency.value },
        userId,
        directionId,
      };

      // Incluimos el cupón en el objeto si existe
      if (appliedCoupon) {
        orderData.coupon = {
          id: appliedCoupon.dataValues.id,
          discount: appliedCoupon.dataValues.discount,
          title: appliedCoupon.dataValues.title,
          content: appliedCoupon.dataValues.content,
        };
      }

      const newOrder = await Order.create(orderData, { transaction });

      const lineitems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      const customizations: {
        productId: string;
        customization: Customization;
      }[] = [];

      for (const product of Object(products)) {
        await OrderProduct.create(
          {
            amount: product.amount,
            price: Number(
              this.currencyService.convertCurrency(
                Number(product.subtotal),
                currency.value,
              ),
            ),
            orderId: newOrder.id,
            productId: product.id,
          },
          { transaction },
        );

        for (const customization of product.customizations) {
          let description = '';

          if (customization.size) {
            description += `Size: ${customization.size}, `;
          }
          if (customization.neck) {
            description += `Neck: ${customization.neck.split(' ')[1]
              ? customization.neck.split(' ')[0] +
              ' ' +
              '(' +
              currencySymbol(currency.name) +
              this.currencyService.convertCurrency(
                Number(
                  eliminarCaracteresNoNumericos(
                    String(customization.neck.split(' ').pop()),
                  ),
                ),
                currency.value,
              ) +
              ')'
              : customization.neck
            }, `;
          }
          if (customization.socks) {
            description += `Socks: ${customization.socks.split(' ')[1]
              ? customization.socks.split(' ')[0] +
              ' ' +
              '(' +
              currencySymbol(currency.name) +
              this.currencyService.convertCurrency(
                Number(
                  eliminarCaracteresNoNumericos(
                    String(customization.socks.split(' ').pop()),
                  ),
                ),
                currency.value,
              ) +
              ')'
              : customization.socks
            }, `;
          }
          if (customization.pants) {
            description += `Pants: ${customization.pants.split(' ')[1]
              ? customization.pants.split(' ')[0] +
              ' ' +
              '(' +
              currencySymbol(currency.name) +
              this.currencyService.convertCurrency(
                Number(
                  eliminarCaracteresNoNumericos(
                    String(customization.pants.split(' ').pop()),
                  ),
                ),
                currency.value,
              ) +
              ')'
              : customization.pants
            }, `;
          }
          if (customization.shorts) {
            description += `Shorts: ${customization.shorts.split(' ')[1]
              ? customization.shorts.split(' ')[0] +
              ' ' +
              '(' +
              currencySymbol(currency.name) +
              this.currencyService.convertCurrency(
                Number(
                  eliminarCaracteresNoNumericos(
                    String(customization.shorts.split(' ').pop()),
                  ),
                ),
                currency.value,
              ) +
              ')'
              : customization.shorts
            }, `;
          }
          if (customization.materials) {
            description += `Materials: ${customization.materials.split(' ')[1]
              ? customization.materials.split(' ')[0] +
              ' ' +
              '(' +
              currencySymbol(currency.name) +
              this.currencyService.convertCurrency(
                Number(
                  eliminarCaracteresNoNumericos(
                    String(customization.materials.split(' ').pop()),
                  ),
                ),
                currency.value,
              ) +
              ')'
              : customization.materials
            }, `;
          }

          if (
            customization.frontSide.texts.some((e) => e.text) ||
            customization.frontSide.numbers.some((e) => e.number)
          ) {
            description += ' | Front side: ';
            if (customization.frontSide.texts.some((e) => e.text)) {
              customization.frontSide.texts
                .filter((e) => e.text)
                .forEach(
                  (e, i) =>
                    (description += `Text ${i}: ${e.text} ${'+ ' +
                    currencySymbol(currency.name) +
                    this.currencyService.convertCurrency(3.99, currency.value)
                    }, `),
                );
            }
            if (customization.frontSide.numbers.some((e) => e.number)) {
              customization.frontSide.numbers
                .filter((e) => e.number)
                .forEach(
                  (e, i) =>
                    (description += `Number ${i + 1}: ${e.number} ${'+ ' +
                    currencySymbol(currency.name) +
                    this.currencyService.convertCurrency(3.99, currency.value)
                    }, `),
                );
            }
          }

          if (
            customization.backSide.texts.some((e) => e.text) ||
            customization.backSide.numbers.some((e) => e.number)
          ) {
            description += ' | Back side: ';
            if (customization.backSide.texts.some((e) => e.text)) {
              customization.backSide.texts
                .filter((e) => e.text)
                .forEach(
                  (e, i) =>
                    (description += `Text ${i}: ${e.text} ${'+ ' +
                    currencySymbol(currency.name) +
                    this.currencyService.convertCurrency(3.99, currency.value)
                    }, `),
                );
            }
            if (customization.backSide.numbers.some((e) => e.number)) {
              customization.backSide.numbers
                .filter((e) => e.number)
                .forEach(
                  (e, i) =>
                    (description += `Number ${i + 1}: ${e.number} ${'+ ' +
                    currencySymbol(currency.name) +
                    this.currencyService.convertCurrency(3.99, currency.value)
                    }, `),
                );
            }
          }
          const currencyChanged = this.currencyService.convertCurrency(
            product.price + customization.price,
            currency.value,
          );
          let unitAmoutByCurrency = Number(currencyChanged) * 100;

          if (appliedCoupon?.discount) {
            // Calcular el monto del descuento
            discountAmount =
              unitAmoutByCurrency * (appliedCoupon.discount / 100);

            unitAmoutByCurrency -= discountAmount;
          }

          lineitems.push({
            price_data: {
              currency: currency.name.toLowerCase(),
              product_data: {
                name: product.title,
                description,
                images: product.images,
              },
              unit_amount: Math.floor(unitAmoutByCurrency),
            },
            quantity: 1,
          });

          customizations.push({
            productId: product.id,
            customization: customization,
          });
        }
      }
      // Url para generar el pago
      const { urlBuy, sessionId } =
        await this.paymentsService.createCheckoutSession(
          lineitems,
          newOrder.id,
          thisUser.email,
        );

      newOrder.sessionId = String(sessionId);
      newOrder.customizations = customizations;
      await newOrder.save({ transaction });

      await this.shoppingCartService.destroyShoppingCart(
        { userId },
        transaction,
      );
      await this.shoppingCartService.CreateShoppingCart(
        { userId },
        transaction,
      );

      await transaction.commit();
      return {
        statusCode: 201,
        data: `New order created successfully. _id: ${newOrder.id}`,
        orderId: newOrder.id,
        urlBuy,
      };
    } catch (error) {
      transaction.rollback();
      throw new InternalServerErrorException(
        `An error occurred while creating your order. \n ${error.message}`,
      );
    }
  }

  async updateOrder(updateDto: UpdateOrderDto): Promise<UpdateStateOrder> {
    try {
      const order = await Order.findByPk(updateDto.orderId, {
        attributes: [
          'id',
          'total',
          'currency',
          'state',
          'customizations',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Product,
            attributes: ['id', 'title', 'images', 'short_description'],
            through: { attributes: ['id', 'price', 'amount'] },
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
          {
            model: User,
            attributes: ['id', 'email', 'firstName', 'lastName', 'phone'],
          },
        ],
      });
      if (!order) throw new NotFoundException('Order not found');

      //* Cancelar orden
      //! Falta realizar validacion de rol
      if (order.state === OrderStateEnum.APROBADO)
        throw new ForbiddenException(
          'It is not allowed to change the order to this state',
        );

      // Actualizar dirección si se envió un nuevo ID de dirección
      if (updateDto.directionId) {
        const newDirection = await Direction.findByPk(updateDto.directionId);
        if (!newDirection) throw new NotFoundException('Direction not found');
        order.directionId = newDirection.id;
      }

      // Actualizar la nota si se envió
      if (updateDto.note) {
        order.note = updateDto.note;
      }

      // Actualizar el código de seguimiento si se envió
      if (updateDto.trackingCode) {
        order.trackingCode = updateDto.trackingCode;
      }

      order.state = updateDto.state;

      order.save();

      return {
        statusCode: 200,
        message: 'Order updated',
        orderUpdated: order,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async findAll(getAllOrdersDto: GetAllOrdersDto): Promise<IGetOrders> {
    try {
      const limit = parseInt(getAllOrdersDto.limit);
      const page = parseInt(getAllOrdersDto.page);
      const searchTerm = getAllOrdersDto.searchTerm;
      const searchBy = getAllOrdersDto.searchBy;

      // Query base
      const baseQuery: WhereOptions = {
        where: { state: { [Op.not]: 'PENDING' } },
        order: [['createdAt', getAllOrdersDto.order]],
        attributes: [
          'id',
          'total',
          'currency',
          'state',
          'customizations',
          'createdAt',
          'updatedAt',
          'coupon',
        ],
        include: [
          {
            model: Product,
            attributes: ['id', 'title', 'images', 'short_description'],
            through: { attributes: ['id', 'price', 'amount'] },
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
          {
            model: User,
            attributes: ['id', 'email', 'firstName', 'lastName', 'phone'],
          },
        ],
      };

      // Aplicar condiciones de filtro de estado si se proporciona
      if (getAllOrdersDto.status) {
        baseQuery.where = { ...baseQuery.where, state: getAllOrdersDto.status };
      }

      // Agregar condiciones de búsqueda por término de búsqueda si se proporciona
      if (searchTerm) {
        if (searchBy === SearchByEnum.User) {
          baseQuery.include[2].where = {
            email: { [Op.iLike]: `%${searchTerm}%` },
          };
        } else if (searchBy === SearchByEnum.Product) {
          baseQuery.include[0].where = {
            title: { [Op.iLike]: `%${searchTerm}%` },
          };
        }
        const ordersWithProductOrUser = await Order.findAll(baseQuery);
        const orderIdsWithProductOrUser = ordersWithProductOrUser.map(
          (order) => order.id,
        );

        baseQuery.include[2].where = null;
        baseQuery.include[0].where = null;

        baseQuery.where = {
          ...baseQuery.where,
          id: { [Op.in]: orderIdsWithProductOrUser },
        };
      }

      // Traer todas las órdenes
      const allOrders = await Order.findAll(baseQuery);
      // Delimitar las órdenes según el límite y el offset
      const orders = allOrders.slice((page - 1) * limit, page * limit);

      const totalOrders = allOrders.length;

      const totalPages = Math.ceil(totalOrders / Number(limit));
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      return {
        statusCode: 200,
        data: {
          orders,
          totalOrders,
          totalPages,
          prevPage,
          page,
          nextPage,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  //Obtener todas las órdenes de un usuario en particular
  async findAllByUser(userId: string): Promise<IOrder> {
    try {
      const orders = await Order.findAll({
        where: {
          userId,
          state: { [Op.not]: 'PENDING' },
        },
        attributes: ['id', 'total', 'state'],
        include: [
          {
            model: Product,
            attributes: ['id', 'title', 'URL', 'sports'],
            through: {
              attributes: ['amount', 'price'],
            },
          },
          {
            model: Direction,
          },
        ],
      });

      if (!orders)
        throw new InternalServerErrorException(
          'Something went wrong when looking for the orders. Check sent id',
        );
      if (!orders.length)
        throw new NotFoundException(
          'No orders found associated with this user',
        );
      return {
        status: 200,
        data: orders,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async deleteOrder(id: string): Promise<Response> {
    try {
      await Order.destroy({ where: { id } });

      return {
        status: 200,
        message: 'Order deleted succesfully.',
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
