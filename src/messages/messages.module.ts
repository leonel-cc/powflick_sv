import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MailService } from '../mail/mail.service';

@Module({
  providers: [MessagesService, MailService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
