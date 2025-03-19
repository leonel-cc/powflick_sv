import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cases, SendMailDto } from './dto/sendMail.dto';
import { Response } from '../products/interface/serviceInterfaces';
import { Templates } from './templates/enums/templates_enum';
import { SERVER_URL } from '../config/enviroments';
import { BrevoService } from '../brevo/brevo.service';

@Injectable()
export class MailService {
  constructor(private readonly brevoService: BrevoService) {}

  async sendMails(sendMailDto: SendMailDto): Promise<Response> {
    const { EmailAddress, subject, context, pdf } = sendMailDto;

    try {
      const config = this.getEmailConfig(subject, context, pdf);

      await this.brevoService.sendEmail({
        to: EmailAddress,
        subject: config.subject,
        template: config.template,
        context: context,
        attachments: config.attachments,
      });

      return {
        status: 200,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  private getEmailConfig(subject: string, context: any, pdf?: any[]) {
    const images = {
      logo: {
        url: SERVER_URL + '/TheSportsLogo.png',
        name: 'TheSportsLogo.png',
      },
      welcome: { url: SERVER_URL + '/Welcome.png', name: 'Welcome.png' },
      team: {
        url: SERVER_URL + '/EMAILS_SPORTS_WELCOME.png',
        name: 'EMAILS_SPORTS_WELCOME.png',
      },
      request: {
        url: SERVER_URL + '/EMAILS_REQUEST-10.png',
        name: 'EMAILS_REQUEST-10.png',
      },
      google: { url: SERVER_URL + '/googleplay.png', name: 'googleplay.png' },
      appStore: { url: SERVER_URL + '/appstore.png', name: 'appstore.png' },
      facebook: { url: SERVER_URL + '/facebook.png', name: 'facebook.png' },
      instagram: { url: SERVER_URL + '/instagram.png', name: 'instagram.png' },
      pinterest: { url: SERVER_URL + '/pinterest.png', name: 'pinterest.png' },
    };

    switch (subject) {
      case Cases.RESET_PASSWORD:
        return {
          subject: 'Password recovery requested for your account at TheSports.',
          template: Templates.recoverPassword,
          // attachments: [
          //   { ...images.logo, cid: 'headerTheSportsLogo@brevo.com' },
          // ],
        };

      case Cases.CREATE_ACCOUNT:
        return {
          subject: 'New account successfully registered.',
          template: Templates.createAccount,
          // attachments: [
          //   { ...images.logo, cid: 'headerTheSportsLogo@brevo.com' },
          //   { ...images.welcome, cid: 'welcomeImage@brevo.com' },
          //   { ...images.team, cid: 'teamImage@brevo.com' },
          //   { ...images.google, cid: 'googleImage@brevo.com' },
          //   { ...images.appStore, cid: 'appImage@brevo.com' },
          //   { ...images.facebook, cid: 'facebookImage@brevo.com' },
          //   { ...images.instagram, cid: 'instagramImage@brevo.com' },
          //   { ...images.pinterest, cid: 'pinterestImage@brevo.com' },
          // ],
        };

      case Cases.PURCHASE:
        return {
          subject: 'New purchase.',
          template: Templates.purchase,
          attachments:
            pdf?.map((item) => ({
              content: item.buffer,
              name: item.name,
            })) || [],
        };

      case Cases.CONTACT_FORM_USER:
        return {
          subject: 'We receive your query',
          template: Templates.contactFormUser,
          // attachments: [
          //   { ...images.logo, cid: 'headerTheSportsLogo@brevo.com' },
          //   { ...images.welcome, cid: 'welcomeImage@brevo.com' },
          //   { ...images.request, cid: 'requestImage@brevo.com' },
          //   { ...images.google, cid: 'googleImage@brevo.com' },
          //   { ...images.appStore, cid: 'appImage@brevo.com' },
          //   { ...images.facebook, cid: 'facebookImage@brevo.com' },
          //   { ...images.instagram, cid: 'instagramImage@brevo.com' },
          //   { ...images.pinterest, cid: 'pinterestImage@brevo.com' },
          // ],
        };

      case Cases.CONTACT_FORM_RESPONSE:
        return {
          subject: 'We responded to your inquiry',
          template: Templates.contactFormResponse,
          // attachments: [
          //   { ...images.logo, cid: 'headerTheSportsLogo@brevo.com' },
          // ],
        };

      case Cases.CONTACT_FORM_ADMIN:
        return {
          subject:
            'userId' in context && context.userId
              ? `Help for User ID: ${context.userId}`
              : 'You received a General Inquiry',
          template: Templates.contactFormAdmin,
          // attachments: [
          //   { ...images.logo, cid: 'headerTheSportsLogo@brevo.com' },
          // ],
        };

      case Cases.UPDATE_ORDER:
        return {
          subject: 'Order status update',
          template: Templates.updateOrder,
          // attachments: [
          //   { ...images.logo, cid: 'headerTheSportsLogo@brevo.com' },
          // ],
        };

      default:
        throw new InternalServerErrorException('Unknown email case');
    }
  }
}
