import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { MailService } from '../mail/mail.service';
import { AuthService } from '../auth/auth.service';
import { StripeService } from '../payments/stripe.service';
import { PdfService } from '../pdf/pdf.service';
import { VercelBlobService } from '../files/vercel-storage.service';
import { ConfigService } from '@nestjs/config';
import { CurrencyService } from '../currency/currency.service';
import { CouponService } from '../coupon/coupon.service';
import { CouponModule } from '../coupon/coupon.module';
import { BrevoService } from 'src/brevo/brevo.service';
import { LLPService } from 'src/payments/LLP.service';
import { PaypalService } from '../payments/paypal.service';

@Module({
  imports: [CouponModule],
  providers: [
    BrevoService,
    OrdersService,
    UsersService,
    ProductsService,
    MailService,
    AuthService,
    StripeService,
    PdfService,
    VercelBlobService,
    ConfigService,
    CurrencyService,
    CouponService,
    LLPService,
    PaypalService,
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
