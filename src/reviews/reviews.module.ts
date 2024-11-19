import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AuthService } from '../auth/auth.service';
import { VercelBlobService } from '../files/vercel-storage.service';
import { ConfigService } from '@nestjs/config';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [
    ReviewsService,
    UsersService,
    MailService,
    AuthService,
    VercelBlobService,
    ConfigService,
  ],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
