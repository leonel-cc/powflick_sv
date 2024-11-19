import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { MailService } from '../mail/mail.service';
import { AuthService } from '../auth/auth.service';
import { StripeService } from '../payments/stripe.service';
import { PdfService } from '../pdf/pdf.service';
import { VercelBlobService } from '../files/vercel-storage.service';
import { ConfigService } from '@nestjs/config';
import { CurrencyService } from 'src/currency/currency.service';
import { CouponService } from 'src/coupon/coupon.service';
import { CouponModule } from 'src/coupon/coupon.module';

@Module({
  imports: [CouponModule],
  providers: [
    OrdersService,
    ShoppingCartService,
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
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
