import { HttpException, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GaPayment = require('ga-payment-sdk');
import { MailService } from '../mail/mail.service';
import { PdfService } from '../pdf/pdf.service';
import { CurrencyService } from '../currency/currency.service';
import {
  SERVER_URL,
  LLP_PUBLIC_KEY,
  LLP_MERCHANT_NUMBER,
  LLP_SECONDARY_MERCHANT_NUMBER,
} from '../config/enviroments';
import * as moment from 'moment-timezone';
import { CreateLlpPaymentDto } from './dto/create-llp-payment.dto';
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
export class LLPService {
  private lianlianPay: typeof GaPayment;

  constructor(
    private mailService: MailService,
    private pdfService: PdfService,
    private currencyService: CurrencyService,
    private sequelize: Sequelize,
  ) {
    const config = {
      env: 'sandbox ',
      sign_type: 'RSA',
      merchant_sign_key: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCQfISUzz4DDmyA
KBVe2ndLDS7uly8WnoWXdpIYCCsBX4WdN+CgggrGVVk+Tf139WSOj3yDHfUgs9qf
ze9OpkMMpZAzX7O45/MxbXC1vPdubrWAudfmkZ9Lrtbc48oqlkDy+wM7RY8bddx5
qffw7DNgk3Xd/dqC1ZcpUp6VhbCmAjjOlsTMMzHqoYmgEWa62mAB+nvHn7/5u+Sf
7v89vOupkQLpeRah8f9s7h6VZ9w5KaxAOHcvohyV2DkLCfCDRgc3rrYQYSXiP0TN
JK/NaqYnVFcD+JuSZ5YnEsutHX1WbawCZkcrqiKwUvK7BIPq/+psNxXfsvXSOxxE
DQds6kwpAgMBAAECggEABqTjMotGeRIsZRxIF0uJLsyqutKoRKxXd6aT2Je6Ooma
SvzVzyu2XnZwRdAvoVjfHeXKk6ZIrmShigsIlR+fd7EUAiNwJUbtRPmZCZJoomMO
5PN8J8sh0x4gHUTlorMJcOL1ZsAFG6h+J04XQQnrjDuxBjCf4Az9stXCGx1sXnCB
VVBqbS8pSAADTKhWDGOVXor34rLpPKjLQUMcNlQKLetfLQegLEYc/Hfh7+MRoacz
Rmkk5mjDOgmerLpvCK3vkTFCuaB7iBYlWfRCrq7fJZR0QLJ41Kckn81VaIXVP4dr
/or1/rz4GSqj3OtC4qqaMIgBPANe/DS87DCIJ3qNcQKBgQDLryMU0YuEDZSbi7Ec
lxMIvk/c2wtrjasZXBjS94iqFu0EP6vFzwEQo8K2stA5SXmro/bg8TWL4HSaPMCq
sdwTmUt0EBVsbjsLkz8zwlyX8A6eIm0GlqyNsPtnKCMed/0BZEFUSyTBbGqrN4dh
dZzmdb5iXdFfrnxUoSnYvntrxQKBgQC1mPJOzmBXX9fI5q15ZK4+372rRQady68r
a2P+OXDWHoAcasKm4hgK6QkcE2+ca0U7HWVLam04GSETPNlOKVX/Ide57TjL1pTo
GAkqIaHDbLzNidjsWqyukHwmRBY5YHbhNoN6BiCBgUoFk3n62fM9Ac85jRlsuMPA
nsV6gl7xFQKBgB519bAiWlQIV+YfMQCOk1kmZPkphP6ztBfZzxiVzklpnk6ZWw39
FDKx2ufJvBwlId4Kalxflltx2N5MIaAlcz03GrKjySBrJ8dmYPhTo9dRHk6F5Xor
xGh4RFC8Dux6k0rG/IInrrqChT1P054+oZVRnIRHdY1yocNiSsjQS9LlAoGABep4
olaYzt/hcLsLFbRQ9N1nGWhDQeq7xydVd5e5dFBEDijwNG2TKO/UiySa8zaPZ9Ca
Vy2dZ0FyUWUfEyvHkGsy0uzGd+WCrljyG3xC/9HQCMYf2ftOOtWcJcb8Dlx1Ivsa
p2QBtRZYKfxW8fQdt3QSoyZUmLUgM2s4tbf/jc0CgYAtTsiajzweyTsWDNLqavUf
qnPXtN26tZDlwradWHU+NUIYtstPtohnhzLhnQ9yu5uM8XIc/Xk00COPKpSWQQ1u
dWaCMyGXtGQm9FVxyd0Ao3+SRYSJ54l6s4wQDYvYMANi5KvYJwq7FHIGS2W5IM0Z
wFfePoVJAi8UgPtuJkSJbg==
-----END PRIVATE KEY-----
`,
      ll_sign_key: LLP_PUBLIC_KEY,
      merchant_id: LLP_MERCHANT_NUMBER,
      sub_merchant_id: LLP_SECONDARY_MERCHANT_NUMBER,
      is_print_log: true,
    };

    this.lianlianPay = new GaPayment(config);
  }

  async createOrderLLP(
    dto: CreateLlpPaymentDto,
    orderId: number,
    email: string,
  ): Promise<any> {
    try {
      const now = moment().tz('Asia/Shanghai');

      const payload = {
        params: {
          merchant_id: LLP_MERCHANT_NUMBER,
          sub_merchant_id: LLP_SECONDARY_MERCHANT_NUMBER,
          merchant_transaction_id: orderId,
          country: 'US',
          redirect_url: `${SERVER_URL}/payments/success/` + orderId,
          notification_url: `${SERVER_URL}/payments/notification`,
          cancel_url: `${SERVER_URL}/payments/failure/` + orderId,
          additional_info: JSON.stringify({
            site_url: 'https://www.powflick.com',
          }),
          merchant_order: {
            merchant_order_id: orderId,
            merchant_user_no: email,
            merchant_order_time: now.format('YYYYMMDDHHmmss'),
            order_description: dto.order_description,
            order_amount: dto.order_amount,
            order_currency_code: dto.order_currency_code,
            products: dto.products,
            // shipping: dto.shipping,
          },
          customer: { ...dto.customer },
        },
      };

      const response = await new Promise<any>((resolve, reject) => {
        this.lianlianPay.pay({
          ...payload,
          successcb: (res: any) => {
            resolve(res);
          },
          failcb: (err: any) => {
            reject(err);
          },
        });
      });

      const parsedBody = JSON.parse(response.body);

      return {
        urlBuy: parsedBody.order.payment_url,
        sessionId: parsedBody.order.ll_transaction_id,
      };
    } catch (error) {
      console.error('LianLianPay SDK Error:', error.message);

      throw new HttpException(
        {
          message: 'Error creando checkout LianLianPay',
          error: error?.message || 'Unknown error',
          raw: JSON.stringify(error, null, 2),
        },
        400,
      );
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

        const paymentIntent = await this.checkPay(orderId);

        const parsedBody = JSON.parse(paymentIntent.body);
        const paymentAmount = parsedBody.order.payment_data.payment_amount;

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
          order: orderId,
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

  async handleEvent(event: any, orderId: string) {
    // Aquí puedes implementar la lógica para manejar los diferentes tipos de eventos de Stripe
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

  async checkPay(orderId: string) {
    try {
      const payload = {
        params: {
          merchant_id: LLP_MERCHANT_NUMBER,
          merchant_transaction_id: orderId,
        },
      };

      const response = await new Promise<any>((resolve, reject) => {
        this.lianlianPay.payResultQuery({
          ...payload,
          successcb: (res: any) => {
            console.log('✅ Estado de la orden recibido:', res);
            resolve(res);
          },
          failcb: (err: any) => {
            console.error('❌ Error consultando el estado del pago:', err);
            reject(err);
          },
        });
      });

      return response;
    } catch (error) {
      console.error('❌ Error general al consultar estado de orden:', error);

      throw new HttpException(
        {
          message: 'Error al consultar el estado de la orden',
          error: error?.message || 'Unknown error',
          stack: error?.stack,
          raw: JSON.stringify(error, null, 2),
        },
        400,
      );
    }
  }

  //post createLLP3DS

  async createLLP3DS(dto: CreateLlpPaymentDto, orderId: number): Promise<any> {
    try {
      const now = moment().tz('Asia/Shanghai');

      console.log(orderId);
      console.log(dto.products.length);

      const payload = {
        params: {
          merchant_id: LLP_MERCHANT_NUMBER,
          sub_merchant_id: LLP_SECONDARY_MERCHANT_NUMBER,
          merchant_transaction_id: orderId,
          country: 'US',
          redirect_url: `${SERVER_URL}/payments/success/` + orderId,
          notification_url: `${SERVER_URL}/payments/notification/` + orderId,
          cancel_url: `${SERVER_URL}/payments/failure/` + orderId,
          additional_info: JSON.stringify({
            site_url: 'https://www.powflick.com',
          }),
          merchant_order: {
            merchant_order_id: orderId,
            merchant_user_no: 1,
            merchant_order_time: now.format('YYYYMMDDHHmmss'),
            order_description: dto.order_description,
            order_amount: dto.order_amount,
            order_currency_code: dto.order_currency_code,
            products: dto.products,
            // shipping: dto.shipping,
          },
          customer: { ...dto.customer },
        },
      };

      console.log(payload, 'payload');

      const response = await new Promise<any>((resolve, reject) => {
        this.lianlianPay.pay({
          ...payload,
          successcb: (res: any) => {
            resolve(res);
          },
          failcb: (err: any) => {
            reject(err);
          },
        });
      });

      console.log(response, 'hasta aca');

      const parsedBody = JSON.parse(response.body);

      return {
        urlBuy3DS:
          parsedBody.order.payment_url +
          '&payment_method=3ds&ll_transaction_id=' +
          parsedBody.order.ll_transaction_id,
        sessionId3DS: parsedBody.order.ll_transaction_id,
      };
    } catch (error) {
      console.error('LianLianPay SDK Error:', error.message);

      throw new HttpException(
        {
          message: 'Error creando checkout LianLianPay',
          error: error?.message || 'Unknown error',
          stack: error?.stack,
          raw: JSON.stringify(error, null, 2),
        },
        400,
      );
    }
  }

  async notification() {
    try {
      return 'success';
    } catch (error) {}
  }
}
