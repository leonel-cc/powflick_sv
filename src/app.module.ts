import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ExcelProductsModule } from './excel-products/excel-products.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SportModule } from './sport/sport.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { MailModule } from './mail/mail.module';
import { PdfService } from './pdf/pdf.service';
import { PdfController } from './pdf/pdf.controller';
import { APP_PIPE } from '@nestjs/core';
import { DirectionsModule } from './directions/directions.module';
import { OrdersModule } from './orders/orders.module';
import { StripeService } from './payments/stripe.service';
import { PaymentsController } from './payments/payments.controller';
import { ReviewsModule } from './reviews/reviews.module';
import { FilesController } from './files/files.controller';
import { CorsMiddleware } from './config/cors.middleware';
import { VercelBlobService } from './files/vercel-storage.service';
import { ConfigService } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { MessagesModule } from './messages/messages.module';
import { CurrencyModule } from './currency/currency.module';
import { CouponController } from './coupon/coupon.controller';
import { CouponModule } from './coupon/coupon.module';

@Module({
  imports: [
    DatabaseModule,
    ExcelProductsModule,
    ProductsModule,
    CategoriesModule,
    SportModule,
    UsersModule,
    AuthModule,
    ShoppingCartModule,
    MailModule,
    DirectionsModule,
    OrdersModule,
    ReviewsModule,
    FilesModule,
    MessagesModule,
    CurrencyModule,
    CouponModule,
  ],
  controllers: [
    AppController,
    PdfController,
    PaymentsController,
    FilesController,
    CouponController,
  ],
  providers: [
    AppService,
    PdfService,
    StripeService,
    VercelBlobService,
    ConfigService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
