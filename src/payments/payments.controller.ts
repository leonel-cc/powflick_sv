// payment.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CLIENT_URL } from '../config/enviroments';
import { StripeService } from './stripe.service';
import { Stripe2Service } from './stripe2.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly stripe2Service: Stripe2Service,
  ) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { lineItems: any[] }) {
    const { urlBuy } = await this.stripeService.createCheckoutSession(
      body.lineItems,
    );
    return { sessionUrl: urlBuy };
  }

  @Get('success/:orderid')
  async handleSuccessPayment(
    @Res() res: Response,
    @Param('orderid') orderid: string,
    @Query('merchant_id') merchant_id: string,
    @Query('merchant_transaction_id') merchant_transaction_id: string,
  ) {
    console.log(merchant_id, ' merchant id');
    console.log(merchant_transaction_id, ' merchant transatcion id');

    await this.stripe2Service.actualizePayment('success', orderid, merchant_id);

    res.redirect(CLIENT_URL + '/thanks-for-buying/' + orderid); // Insertar ruta a donde queremos que se diriga cuando se realize el pago
  }

  // Ruta para manejar un pago fallido
  @ApiOperation({
    summary: 'Ruta para manejar un pago fallido.',
  })
  @Get('failure/:orderid')
  async handleFailurePayment(
    @Res() res: Response,
    @Param('orderid') orderid: string,
  ) {
    await this.stripeService.actualizePayment('failure', orderid);

    res.redirect(CLIENT_URL + '/paymentgateway'); // Insertar ruta a donde queremos que se diriga cuando se realize el pago
  }

  @Post('webhook/:orderid')
  @HttpCode(200) // Responde con código 200 para confirmar la recepción del evento
  async handleStripeEvent(
    @Body() event: any,
    @Param('orderid') orderid: string,
  ) {
    // Maneja el evento recibido desde Stripe
    try {
      await this.stripe2Service.handleEvent(event, orderid);
    } catch (error) {
      console.error('Error handling Stripe event:', error);
    }
  }

  @Post('LLpay')
  async createLLPay(
    @Body()
    { body, orderId, email }: { body: any; orderId: number; email: string },
  ) {
    try {
      const response = await this.stripe2Service.createOrderLLP(
        body,
        orderId,
        email,
      );
      return response;
    } catch (error) {
      console.error('Error creating LLPay order:', error);
      throw new Error('Error al crear el pago con LianLianPay');
    }
  }
}
