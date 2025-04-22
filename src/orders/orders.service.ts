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
import { UsersService } from '../users/users.service';
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
import { StripeService } from '../payments/stripe.service';
import { Customization } from '../products/entity/customization.entity';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { CurrencyService } from '../currency/currency.service';
import {
  calculateCustomizationPrice,
  currencySymbol,
  eliminarCaracteresNoNumericos,
} from '../utils/tools';
import { CouponService } from '../coupon/coupon.service';
import {
  CreateLlpPaymentDto,
  ProductDto,
  CustomerDto,
  ShippingDto,
} from 'src/payments/dto/create-llp-payment.dto';
import { LLPService } from 'src/payments/LLP.service';
import { FrontCartStore } from '../shopping-cart/dto/add.bulkCustomizations.dto';
@Injectable()
export class OrdersService {
  constructor(
    private paymentsService: StripeService,
    private llpService: LLPService,
    private userService: UsersService,
    private currencyService: CurrencyService,
    private sequelize: Sequelize,
    private couponService: CouponService,
  ) {}

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

      const directions = await Direction.findAll({
        where: { userId: order.userId },
      });

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
      const { userId, directionId, couponId, note, cartProducts } = data;
      //Obtenemos el id del carrito del usuario que realiza la peticion
      const thisUser = await this.userService.findByPkGenericUser(userId, {
        transaction,
      });

      const { products, total } = await this.filterPrices(cartProducts);

      if (cartProducts?.length === 0)
        throw new HttpException('The cart is empty', 400);

      // Obtenemos el descuento del cupón si existe
      let discountAmount = 0;
      let appliedCoupon = null;

      if (couponId) {
        const couponUser =
          await this.couponService.findOneCouponUserByCouponIdandUserId(
            userId,
            couponId,
          );

        if (!couponUser || !couponUser.dataValues.active) {
          throw new HttpException('Coupon not valid or inactive', 400);
        }

        const usedCoupon = await Order.findOne({
          where: {
            userId,
            'coupon.id': couponId,
            state: OrderStateEnum.APROBADO, // Verifica que el estado sea APROBADO
          },
        });
        if (usedCoupon) {
          throw new HttpException('User has already used this coupon', 400);
        }

        const coupon = await this.couponService.findOne(couponId);
        if (coupon) {
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
        note?: string;
      } = {
        total: this.currencyService.convertCurrency(
          Number(totalWithDiscount),
          currency.value,
        ),
        currency: { name: currency.name, value: currency.value },
        userId,
        directionId,
        note,
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

      const lineitems: any[] = [];
      const customizations: {
        productId: string;
        customization: Customization;
      }[] = [];

      for (const product of Object(cartProducts)) {
        const subtotal = product.totalProduct + product.totalCustomization;

        await OrderProduct.create(
          {
            amount: product.amount,
            price: Number(
              this.currencyService.convertCurrency(
                Number(subtotal),
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
            description += `Neck: ${
              customization.neck.split(' ')[1]
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
            description += `Socks: ${
              customization.socks.split(' ')[1]
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
            description += `Pants: ${
              customization.pants.split(' ')[1]
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
            description += `Shorts: ${
              customization.shorts.split(' ')[1]
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
            description += `Materials: ${
              customization.materials.split(' ')[1]
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
                    (description += `Text ${i}: ${e.text} ${
                      '+ ' +
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
                    (description += `Number ${i + 1}: ${e.number} ${
                      '+ ' +
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
                    (description += `Text ${i}: ${e.text} ${
                      '+ ' +
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
                    (description += `Number ${i + 1}: ${e.number} ${
                      '+ ' +
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
            product_id: product.id,
            name: product.title,
            description: description,
            price: Number(
              this.currencyService.convertCurrency(
                Number(product.subtotal),
                currency.value,
              ),
            ),
            quantity: 1,
            category: 'Custom Jerseys',
            sku: product.slug,
            url: product.images[0] || '',
            shipping_provider: 'other',
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

      // Actualizar los comentarios adicionales si se envió
      if (updateDto.note) {
        order.note = updateDto.note;
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
      const purchaseDate = getAllOrdersDto.purchaseDate;
      const order = getAllOrdersDto.order;
      const orderBy = getAllOrdersDto.orderBy;

      // Query base
      const baseQuery: WhereOptions = {
        where: { state: { [Op.not]: 'PENDING' } },
        order: [
          [
            orderBy === 'purchaseDate' ? 'createdAt' : 'id',
            orderBy === 'purchaseDate' ? purchaseDate : order,
          ],
        ],
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
          (o) => o.id,
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

  async createOrderLLP(
    data: CreateOrderDto,
    currency: { name: string; value: number },
  ): Promise<object> {
    const transaction: Transaction = await this.sequelize.transaction();

    try {
      const { userId, directionId, couponId, note, cartProducts } = data;
      //Obtenemos el id del carrito del usuario que realiza la peticion
      const thisUser = await this.userService.findByPkGenericUser(userId, {
        transaction,
      });

      const { products, total } = await this.filterPrices(cartProducts);

      const thisDirection = await Direction.findByPk(directionId);

      if (cartProducts?.length === 0)
        throw new HttpException('The cart is empty', 400);

      // Obtenemos el descuento del cupón si existe
      let discountAmount = 0;
      let appliedCoupon = null;

      if (couponId) {
        const couponUser =
          await this.couponService.findOneCouponUserByCouponIdandUserId(
            userId,
            couponId,
          );

        if (!couponUser || !couponUser.dataValues.active) {
          throw new HttpException('Coupon not valid or inactive', 400);
        }

        const usedCoupon = await Order.findOne({
          where: {
            userId,
            'coupon.id': couponId,
            state: OrderStateEnum.APROBADO, // Verifica que el estado sea APROBADO
          },
        });
        if (usedCoupon) {
          throw new HttpException('User has already used this coupon', 400);
        }

        const coupon = await this.couponService.findOne(couponId);
        if (coupon) {
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
        note?: string;
      } = {
        total: this.currencyService.convertCurrency(
          Number(totalWithDiscount),
          currency.value,
        ),
        currency: { name: currency.name, value: currency.value },
        userId,
        directionId,
        note,
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

      const lineitems: any[] = [];
      const customizationsOrder: {
        productId: string;
        customization: Customization;
      }[] = [];

      for (const {
        product,
        customizations,
        totalCustomization,
        totalProduct,
      } of products) {
        const subtotal = totalProduct + totalCustomization;

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

        for (const customization of customizations) {
          let description = '';

          // Función auxiliar para procesar personalizaciones comunes
          const processCustomization = (type: string, value: string) => {
            if (value) {
              const [name, price] = value.split(' ');
              const formattedPrice = price
                ? ` (${currencySymbol(
                    currency.name,
                  )}${this.currencyService.convertCurrency(
                    Number(eliminarCaracteresNoNumericos(price)),
                    currency.value,
                  )})`
                : '';
              description += `${type}: ${name}${formattedPrice}, `;
            }
          };

          // Procesar personalizaciones comunes
          processCustomization('Size', customization.size);
          processCustomization('Neck', customization.neck);
          processCustomization('Socks', customization.socks);
          processCustomization('Pants', customization.pants);
          processCustomization('Shorts', customization.shorts);
          processCustomization('Materials', customization.materials);

          // Procesar textos y números del lado frontal
          const processSide = (side: string, texts: any[], numbers: any[]) => {
            if (texts.some((e) => e.text) || numbers.some((e) => e.number)) {
              description += ` | ${side}: `;
              texts
                .filter((e) => e.text)
                .forEach(
                  (e, i) =>
                    (description += `Text ${i}: ${e.text} (+ ${currencySymbol(
                      currency.name,
                    )}${this.currencyService.convertCurrency(
                      3.99,
                      currency.value,
                    )}), `),
                );
              numbers
                .filter((e) => e.number)
                .forEach(
                  (e, i) =>
                    (description += `Number ${i + 1}: ${
                      e.number
                    } (+ ${currencySymbol(
                      currency.name,
                    )}${this.currencyService.convertCurrency(
                      3.99,
                      currency.value,
                    )}), `),
                );
            }
          };

          // Procesar lados frontal y trasero
          processSide(
            'Front side',
            customization.frontSide.texts,
            customization.frontSide.numbers,
          );
          processSide(
            'Back side',
            customization.backSide.texts,
            customization.backSide.numbers,
          );

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
            product_id: product.id,
            name: product.title,
            price: Number(
              this.currencyService.convertCurrency(
                Number(subtotal),
                currency.value,
              ),
            ),
            description: description
              .replace(/[^a-zA-Z0-9\s,:]/g, '') // Elimina caracteres especiales
              .slice(0, 128), // Limita la longitud a 128 caracteres
            category: 'custom jersey',
            sku: product.id,
            url:
              product.images[0] ||
              'https://www.powflick.com/products/' + product.id, // Actualización aquí
            quantity: 1,
            shipping_provider: 'other',
          });

          customizationsOrder.push({
            productId: product.id,
            customization: customization,
          });
        }
      }

      const address = {
        line1: 'Calle Principal 123', //address
        line2: 'Apto 4B', //apartment
        country: 'US', // country
        city: 'New York', // city
        state: 'NY', // state
        postal_code: '10001', // postal code
        district: 'Manhattan', // locacion -> district
      };

      const shipping = {
        first_name: thisUser.firstName,
        last_name: thisUser.lastName,
        name: thisUser.firstName + thisUser.lastName,
        phone: thisDirection.phone,
        cycle: '24h',
        address,
      };

      const customer = {
        customer_type: 'I', // I = Individual
        first_name: thisUser.firstName,
        last_name: thisUser.lastName,
        full_name: thisUser.firstName + thisUser.lastName,
        gender: 'male',
        email: thisUser.email,
        phone: thisUser.phone,
        // address,
      };

      const payload: any = {
        order_amount: Number(total), // suma de todos los montos
        order_currency_code: 'USD',
        order_description: 'Custom jerseys order',
        shipping,
        customer,
        products: lineitems,
      };

      console.log('payload', payload);

      // Url para generar el pago
      const { urlBuy, sessionId } = await this.llpService.createOrderLLP(
        payload,
        newOrder.id,
        thisUser.email,
      );

      newOrder.sessionId = String(sessionId);
      newOrder.customizations = customizationsOrder;
      await newOrder.save({ transaction });

      await transaction.commit();
      return {
        statusCode: 201,
        data: `New order created successfully. _id: ${newOrder.id}`,
        orderId: newOrder.id,
        urlBuy,
      };
    } catch (error) {
      transaction.rollback();
      console.log(error.message);
      throw new InternalServerErrorException(
        `An error occurred while creating your order. \n ${error.message}`,
      );
    }
  }

  async filterPrices(data: FrontCartStore[]) {
    let total = 0;
    const products: FrontCartStore[] = [];

    try {
      // Procesar todos los productos en paralelo
      await Promise.all(
        data.map(async ({ product, customizations, amount }) => {
          let totalCustomization = 0;

          // Buscar el producto en la base de datos
          const thisProduct = await Product.findByPk(product.id);
          console.log('thisProduct', thisProduct);

          if (!thisProduct) {
            throw new NotFoundException(
              `Product with ID ${product.id} not found`,
            );
          }

          // Calcular el precio total del producto
          const totalProduct = thisProduct.price * amount;

          // Calcular el precio total de las personalizaciones
          for (const custom of customizations) {
            totalCustomization += calculateCustomizationPrice(custom);
            console.log('totalCustomization', totalCustomization);
          }

          // Agregar el producto procesado a la lista
          products.push({
            amount,
            product: thisProduct,
            customizations,
            totalCustomization,
            totalProduct,
          });

          // Actualizar el total general
          total += totalCustomization + totalProduct;
        }),
      );
      console.log('products', products, 'total', total);

      return { total, products };
    } catch (error) {
      throw new HttpException(`Error filtering prices: ${error.message}`, 400);
    }
  }
}
