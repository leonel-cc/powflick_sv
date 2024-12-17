// payment.controller.ts
import { Controller, Post, Body, Get, Param, Res, HttpCode } from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CLIENT_URL } from '../config/enviroments';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] }) {
    const { lineItems } = body;
    const sessionUrl = await this.stripeService.createCheckoutSession(lineItems);
    return { sessionUrl };
  }

  // Ruta para manejar un pago exitoso
  @Get('success/:orderid')
  async handleSuccessPayment(
  @Res() res: Response,
    @Param('orderid') orderid: string,
  ) {
    await this.stripeService.actualizePayment('success', orderid);

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
      await this.stripeService.handleEvent(event, orderid);
    } catch (error) {
      console.error('Error handling Stripe event:', error);
    }
  }
}