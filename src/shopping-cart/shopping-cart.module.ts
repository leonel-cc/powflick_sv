import { forwardRef, Module } from '@nestjs/common';
import { ShoppingCartController } from './shopping-cart.controller';
import { ShoppingCartService } from './shopping-cart.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { ProductsModule } from '../products/products.module';
import { FilesModule } from '../files/files.module';
import { BrevoService } from 'src/brevo/brevo.service';

@Module({
  imports: [
    forwardRef(() => ProductsModule),
    forwardRef(() => FilesModule),
    // Otros módulos necesarios
  ],
  controllers: [ShoppingCartController],
  providers: [
    ShoppingCartService,
    UsersService,
    ProductsService,
    AuthService,
    MailService,
    BrevoService,
  ],
  exports: [ShoppingCartService],
})
export class ShoppingCartModule {}
