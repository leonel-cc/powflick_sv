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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CLIENT_URL } from '../config/enviroments';
import { StripeService } from './stripe.service';
import { LLPService } from './LLP.service';
import { CreateLlpPaymentDto } from './dto/create-llp-payment.dto';
import { PaypalService } from './paypal.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { GetUser } from 'src/auth/decorator/auth-user.decorator';
import { IGetUser } from 'src/auth/interfaces/getUser.interface';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly llpService: LLPService,
    private readonly paypalService: PaypalService,
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
    @Query('token') token: string,
    @Query('PayerID') payerId: string,
  ) {
    console.log(
      'PayPal SUCCESS endpoint hit for order:',
      orderid,
      'token:',
      token,
      'payerId:',
      payerId,
    );

    try {
      // Captura el pago en LLP usando ambos IDs correctamente
      await this.llpService.actualizePayment('success', orderid);
      // Redirige al frontend
      res.redirect(CLIENT_URL + '/thanks-for-buying/' + orderid);
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      res.redirect(CLIENT_URL + '/checkout?paypal_error=1');
    }
  }

  @Get('email/:orderid')
  @UseGuards(JwtAuthGuard)
  async generatePurchaseEmail(
  @GetUser() { userId }: IGetUser,
    @Param('orderid') orderId: string,
  ) {
    try {
      // Captura el pago en PayPal usando ambos IDs correctamente
      await this.stripeService.generatePurchaseEmail(orderId, userId);
      // Redirige al frontend
      return 'Email sent successfully';
    } catch (error) {
      console.error('Error generating email:', error);
    }
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
    console.log('PayPal FAILURE endpoint hit for order:', orderid); // <-- Agrega log
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
