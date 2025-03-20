import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { BrevoService } from 'src/brevo/brevo.service';

@Module({
  providers: [UsersService, AuthService, MailService, BrevoService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
