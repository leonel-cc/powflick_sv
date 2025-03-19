import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MailService } from '../mail/mail.service';
import { BrevoService } from 'src/brevo/brevo.service';

@Module({
  providers: [MessagesService, MailService, BrevoService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
