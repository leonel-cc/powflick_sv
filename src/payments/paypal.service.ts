// src/paypal/paypal.service.ts
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';
import {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_SIGNATURE,
  PAYPAL_LIVE,
} from '../config/enviroments';
import { SERVER_URL } from '../config/enviroments';

import { Sequelize } from 'sequelize-typescript';

import { MailService } from '../mail/mail.service';
import { PdfService } from '../pdf/pdf.service';
import { CurrencyService } from '../currency/currency.service';

import { Transaction } from 'sequelize';
import { CouponUser } from 'src/coupon/entities/coupon-user.entity';
import { Direction } from 'src/directions/entity/directions.entity';
import { Cases } from 'src/mail/dto/sendMail.dto';
import { IPurchaseContext } from 'src/mail/interfaces/purchase-context.interface';
import { Product } from 'src/products/entity/products.entity';
import { User } from '../users/entity/users.entity';
import { currencySymbol } from '../utils/tools';
import { Order, OrderStateEnum } from '../orders/entity/order.entity';

@Injectable()
export class PaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor(
    private mailService: MailService,
    private pdfService: PdfService,
    private currencyService: CurrencyService,
    private sequelize: Sequelize,
  ) {
    const clientId = PAYPAL_CLIENT_ID;
    const clientSecret = PAYPAL_CLIENT_SECRET;
    const isLive = PAYPAL_LIVE;

    const environment = isLive
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder(total: string, orderId: string, currency = 'USD') {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: total,
          },
        },
      ],
      application_context: {
        return_url: `${SERVER_URL}/payments/success/${orderId}`,
        cancel_url: `${SERVER_URL}/payments/failure/${orderId}`,
      },
    });

    try {
      const response = await this.client.execute(request);
      const result = response.result;
      // Buscar el link de aprobación
      const approveLink = result.links?.find(
        (l: any) => l.rel === 'approve',
      )?.href;
      return {
        ...result,
        approveUrl: approveLink,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error creating PayPal order: ${error.message}`,
      );
    }
  }

  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);

    // No se pasa payment_source explícitamente, se puede omitir o personalizar según necesidad.
    request.requestBody({
      payment_source: undefined,
    });

    try {
      const response = await this.client.execute(request);
      return response.result;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error capturing PayPal order: ${error.message}`,
      );
    }
  }

  async actualizePayment(
    state: string,
    orderId: string | number,
    paypalOrderId?: string,
  ) {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      // orderId aquí es el ID interno (entero)
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Product,
            attributes: ['id', 'selled'],
          },
          {
            model: Direction,
          },
        ],
      });
      const { userId, coupon } = order;

      const thisUser = await User.findByPk(userId);
      if (state == 'failure') {
        order.state = OrderStateEnum.RECHAZADO;
        await order.save();
      }
      if (state == 'success') {
        if (coupon) {
          await CouponUser.update(
            { active: false },
            {
              where: {
                userId,
                couponId: coupon.id,
              },
            },
          );
        }

        // Usar el token de PayPal (paypalOrderId) para capturar el pago
        const paymentIntent = await this.captureOrder(paypalOrderId);
        console.log('paymentIntent', paymentIntent);

        // Obtener el monto pagado desde la respuesta de PayPal
        let paymentAmount = 0;
        if (
          paymentIntent &&
          paymentIntent.purchase_units &&
          paymentIntent.purchase_units[0] &&
          paymentIntent.purchase_units[0].payments &&
          paymentIntent.purchase_units[0].payments.captures &&
          paymentIntent.purchase_units[0].payments.captures[0]
        ) {
          paymentAmount =
            paymentIntent.purchase_units[0].payments.captures[0].amount.value;
        }

        console.log('paymentAmount', paymentAmount);

        order.paymentData = paymentIntent;
        order.state = OrderStateEnum.PAGO;
        order.total = paymentAmount;
        await order.save();
        const pdf = [];
        const products = [];
        // iterar sobre los productos vendidos y actualizar datos
        for (const product of order.products) {
          const thisProduct = await Product.findByPk(product.id);
          const customizations = order.customizations.filter(
            (e) => e.productId === product.id,
          );

          thisProduct.selled += customizations.length;
          thisProduct.save();
          //obtener customizacion para generar el pdf
          for (const { customization } of customizations || []) {
            //generar pdfs
            const buffer = await this.pdfService.generatePdf(
              customization,
              thisProduct,
              orderId,
            );
            //se agregan los pdf para adjuntar en el mail
            pdf.push({ name: customization.designName, buffer });
          }

          const totalCustomizationPrice = customizations?.reduce(
            (acc, { customization }) => (acc += customization.price),
            0,
          );
          const customizationData = [];
          customizations.forEach(({ customization }, i) =>
            customizationData.push({
              index: i + 1,
              text: customization.backSide.texts
                .map((t) => t.text) // Extrae solo la propiedad `text`
                .join(' '), // Une los valores con un espacio
              number: customization.backSide.numbers
                .map((n) => n.number) // Extrae solo la propiedad `number`
                .join(' '),
            }),
          );
          //se agregan los productos al array para mostrarlos en el mail
          products.push({
            productName: thisProduct.title,
            customizationData,
            price: this.currencyService.convertCurrency(
              thisProduct.price * customizations.length +
                totalCustomizationPrice,
              order.currency.value,
            ),
            amount: customizations.length,
            imageURL: thisProduct.images[0],
          });
        }

        const context: IPurchaseContext = {
          name: thisUser.firstName + ' ' + thisUser.lastName,
          order: String(orderId), // <-- conversión a string
          products,
          direction: order.direction,
          user: thisUser,
          total: order.total,
          currencySymbol: currencySymbol(order.currency.name),
          purchaseDate: order.updatedAt
            .toString()
            .split(' ')
            .slice(0, 4)
            .join(' '),
        };

        const mailData = {
          EmailAddress: thisUser.email,
          subject: Cases.PURCHASE,
          context,
          pdf,
        };

        //Sending mail
        await this.mailService.sendMails(mailData);
      }

      await Order.destroy({
        where: { state: OrderStateEnum.PENDIENTE, userId: thisUser.id },
        transaction,
      }); // Elimina todas las ordenes pendientes anteriores.

      await transaction.commit();
      return `The order status is: ${state}`;
    } catch (error) {
      await transaction.rollback();
      throw new HttpException('Error updating payment' + error.message, 404);
    }
  }
}
