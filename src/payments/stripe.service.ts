// stripe.service.ts
import { HttpException, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { STRIPE_SECRET, SERVER_URL } from '../config/enviroments';
import { Direction } from '../directions/entity/directions.entity';
import { Cases } from '../mail/dto/sendMail.dto';
import { IPurchaseContext } from '../mail/interfaces/purchase-context.interface';
import { MailService } from '../mail/mail.service';
import { Order, OrderStateEnum } from '../orders/entity/order.entity';
import { PdfService } from '../pdf/pdf.service';
import { Product } from '../products/entity/products.entity';
import { User } from '../users/entity/users.entity';
import Stripe from 'stripe';
import { CurrencyService } from 'src/currency/currency.service';
import { currencySymbol } from 'src/utils/tools';
import { CouponUser } from 'src/coupon/entities/coupon-user.entity';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private mailService: MailService,
    private pdfService: PdfService,
    private currencyService: CurrencyService,
    private sequelize: Sequelize,
  ) {
    this.stripe = new Stripe(STRIPE_SECRET, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    orderId?: number,
    email?: string,
  ) {
    try {
      const session: Stripe.Checkout.Session =
        await this.stripe.checkout.sessions.create({
          payment_method_configuration: 'pmc_1QPRnVKXCIFqthWbK6rSvEP8',
          line_items: lineItems,
          mode: 'payment',
          success_url: SERVER_URL + '/payments/success/' + orderId,
          cancel_url: SERVER_URL + '/payments/failure/' + orderId,
          customer_email: email,
          client_reference_id: orderId.toString(),
          payment_method_options: {
            card: {
              installments: {
                enabled: true,
              },
            },
          },
        });
      // utilizar ngrok para obtener la url segura del webhook
      // const webhook = await this.stripe.webhookEndpoints.create({
      //   url: 'https://7fa0-190-175-198-10.ngrok-free.app/payments/webhook/' + orderId,
      //   enabled_events: ['payment_intent.succeeded', 'payment_intent.payment_failed'],
      // });

      return {
        urlBuy: session.url,
        sessionId: session.id,
      };

    } catch (error) {
      console.log(error.message);
      
      throw new HttpException('Error to create checkout session: ' + error.message, 400);
    }
  }

  async actualizePayment(state: string, orderId: string) {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
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

        const session = await this.stripe.checkout.sessions.retrieve(
          order.sessionId,
        );

        const paymentIntent = await this.stripe.paymentIntents.retrieve(
          String(session.payment_intent),
        );

        const paymentMethod = await this.stripe.paymentMethods.retrieve(
          String(paymentIntent.payment_method),
        );

        order.paymentData = paymentMethod;
        order.state = OrderStateEnum.PAGO;
        order.total = paymentIntent.amount / 100;
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
              text: customization.backSide.texts.reduce(
                (acc, text) => (acc += text + ' '),
                '',
              ),
              number: customization.backSide.numbers.reduce(
                (acc, text) => (acc += text + ' '),
                '',
              ),
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
        where: { state: OrderStateEnum.PENDIENTE },
        transaction,
      }); // Elimina todas las ordenes pendientes anteriores.

      await transaction.commit();
      return `The order status is: ${state}`;
    } catch (error) {
      await transaction.rollback();
      throw new HttpException('Error updating payment' + error.message, 404);
    }
  }

  async handleEvent(event: any, orderId: string) {
    // Aquí puedes implementar la lógica para manejar los diferentes tipos de eventos de Stripe
    const order = await Order.findByPk(orderId);
    try {
      console.log('Received Stripe event:', event.type);
      if (event.type === 'payment_intent.succeeded')
        await this.actualizePayment('success', orderId);
      if (event.type === 'payment_intent.payment_failed')
        await this.actualizePayment('failure', orderId);
      // await this.stripe.webhookEndpoints.del(order.webhookId);
    } catch (error) {
      // await this.stripe.webhookEndpoints.del(order.webhookId);
      throw new HttpException(error.message, 500);
    }
  }
}
