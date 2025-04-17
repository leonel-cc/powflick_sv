// payment.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Res,
  Header,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CLIENT_URL } from '../config/enviroments';
import { StripeService } from './stripe.service';
import { LLPService } from './LLP.service';
import { CreateLlpPaymentDto } from './dto/create-llp-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly llpService: LLPService,
  ) { }

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
  ) {
    await this.llpService.actualizePayment('success', orderid);

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
    await this.llpService.actualizePayment('failure', orderid);

    res.redirect(CLIENT_URL + '/checkout'); // Insertar ruta a donde queremos que se diriga cuando se realize el pago
  }

  @Post('webhook/:orderid')
  @HttpCode(200) // Responde con código 200 para confirmar la recepción del evento
  async handleStripeEvent(
    @Body() event: any,
    @Param('orderid') orderid: string,
  ) {
    // Maneja el evento recibido desde Stripe
    try {
      await this.llpService.handleEvent(event, orderid);
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
      const response = await this.llpService.createOrderLLP(
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

  @Post('LLpay3DS')
  async createLLPay3DS(
    @Body()
    payload: {
      body: CreateLlpPaymentDto;
      orderId: number;
    },
  ) {
    const { body, orderId } = payload;

    try {
      const response = await this.llpService.createLLP3DS(body, orderId);
      return response;
    } catch (error) {
      console.error('Error creating LLPay order:', error);
      throw new Error('Error al crear el pago con LianLianPay');
    }
  }

  @Post('notification')
  @HttpCode(200)
  async handleLlpNotification(@Req() req: Request, @Res() res: Response) {
    console.log('✅ Notificación recibida:', req.body);

    // Procesá el body, guardá en DB, etc. si lo necesitás

    // Respuesta obligatoria según la doc de LianLian
    res.json({
      code: '200',
      message: 'success',
    });
  }
}
