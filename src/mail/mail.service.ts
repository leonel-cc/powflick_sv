import { MailerService } from '@nestjs-modules/mailer';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cases, SendMailDto } from './dto/sendMail.dto';
import { Response } from '../products/interface/serviceInterfaces';
import { Templates } from './templates/enums/templates_enum';
import { SERVER_URL } from '../config/enviroments';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMails(sendMailDto: SendMailDto): Promise<Response> {
    const { EmailAddress, subject, context } = sendMailDto;
    const leadImageUrl = SERVER_URL + '/TheSportsLogo.png';
    const welcomeImageUrl = SERVER_URL + '/Welcome.png';
    const teamImageUrl = SERVER_URL + '/EMAILS_SPORTS_WELCOME.png';
    const requestImageUrl = SERVER_URL + '/EMAILS_REQUEST-10.png';
    const googleImage = SERVER_URL + '/appstore.png';
    const AppStoreImage = SERVER_URL + '/googleplay.png';
    const facebookImage = SERVER_URL + '/facebook.png';
    const instagramImage = SERVER_URL + '/instagram.png';
    const pinterestImage = SERVER_URL + '/pinterest.png';

    try {
      let mail;
      switch (subject) {
        case Cases.RESET_PASSWORD:
          mail = await this.mailerService.sendMail({
            to: EmailAddress,
            subject:
              'Password recovery requested for your account at TheSports.',
            template: Templates.recoverPassword,
            context: context,
            attachments: [
              {
                filename: 'TheSports.png',
                path: leadImageUrl,
                cid: 'headerTheSportsLogo',
              },
            ],
          });
          break;
        case Cases.CREATE_ACCOUNT:
          mail = await this.mailerService.sendMail({
            to: EmailAddress,
            subject: 'New account successfully registered.',
            template: Templates.createAccount,
            context: context,
            attachments: [
              {
                filename: 'TheSportsLogo.png',
                path: leadImageUrl,
                cid: 'headerTheSportsLogo',
              },
              {
                filename: 'Welcome.png',
                path: welcomeImageUrl,
                cid: 'welcomeImage',
              },
              {
                filename: 'EMAILS_SPORTS_WELCOME.png',
                path: teamImageUrl,
                cid: 'teamImage',
              },
              {
                filename: 'googleplay.png',
                path: googleImage,
                cid: 'googleImage',
              },
              {
                filename: 'appstore.png',
                path: AppStoreImage,
                cid: 'appImage',
              },
              {
                filename: 'facebook.png',
                path: facebookImage,
                cid: 'facebookImage',
              },
              {
                filename: 'instagram.png',
                path: instagramImage,
                cid: 'instagramImage',
              },
              {
                filename: 'pinterest.png',
                path: pinterestImage,
                cid: 'pinterestImage',
              },
            ],
          });

          break;
        case Cases.PURCHASE:
          const attachments = sendMailDto.pdf.map((e) => {
            return {
              filename: e.name,
              content: e.buffer,
            };
          });

          mail = await this.mailerService.sendMail({
            to: EmailAddress,
            subject: 'New purchase.',
            template: Templates.purchase,
            context: context,
            attachments: [
              {
                filename: 'TheSports.png',
                path: leadImageUrl,
                cid: 'headerTheSportsLogo',
              },
              {
                filename: 'Welcome.png',
                path: welcomeImageUrl,
                cid: 'welcomeImage',
              },
              {
                filename: 'googleplay.png',
                path: googleImage,
                cid: 'googleImage',
              },
              {
                filename: 'appstore.png',
                path: AppStoreImage,
                cid: 'appImage',
              },
              {
                filename: 'facebook.png',
                path: facebookImage,
                cid: 'facebookImage',
              },
              {
                filename: 'instagram.png',
                path: instagramImage,
                cid: 'instagramImage',
              },
              {
                filename: 'pinterest.png',
                path: pinterestImage,
                cid: 'pinterestImage',
              },
              ...attachments,
            ],
          });
          break;
        case Cases.CONTACT_FORM_USER:
          mail = await this.mailerService.sendMail({
            to: EmailAddress,
            subject: 'We receive your query',
            template: Templates.contactFormUser,
            context: context,
            attachments: [
              {
                filename: 'TheSports.png',
                path: leadImageUrl,
                cid: 'headerTheSportsLogo',
              },
              {
                filename: 'Welcome.png',
                path: welcomeImageUrl,
                cid: 'welcomeImage',
              },
              {
                filename: 'EMAILS_REQUEST-10.png',
                path: requestImageUrl,
                cid: 'requestImage',
              },
              {
                filename: 'googleplay.png',
                path: googleImage,
                cid: 'googleImage',
              },
              {
                filename: 'appstore.png',
                path: AppStoreImage,
                cid: 'appImage',
              },
              {
                filename: 'facebook.png',
                path: facebookImage,
                cid: 'facebookImage',
              },
              {
                filename: 'instagram.png',
                path: instagramImage,
                cid: 'instagramImage',
              },
              {
                filename: 'pinterest.png',
                path: pinterestImage,
                cid: 'pinterestImage',
              },
            ],
          });
          break;
        case Cases.CONTACT_FORM_RESPONSE:
          mail = await this.mailerService.sendMail({
            to: EmailAddress,
            subject: 'We responded to your inquiry',
            template: Templates.contactFormResponse,
            context: context,
            attachments: [
              {
                filename: 'TheSports.png',
                path: leadImageUrl,
                cid: 'headerTheSportsLogo',
              },
            ],
          });
          break;
        case Cases.CONTACT_FORM_ADMIN:
          if ('userId' in context)
            mail = await this.mailerService.sendMail({
              to: EmailAddress,
              subject: context.userId
                ? `Help for User ID: ${context.userId}`
                : 'You received a General Inquiry',
              template: Templates.contactFormAdmin,
              context: context,
              attachments: [
                {
                  filename: 'TheSports.png',
                  path: leadImageUrl,
                  cid: 'headerTheSportsLogo',
                },
              ],
            });
          break;
      }
      //If mail.accepted: [ user_email ]
      if (mail && mail.accepted && mail.accepted.length) {
        return {
          status: 200,
          message: 'The link to recover the password has been sent',
        };
      } else {
        throw new InternalServerErrorException('Error sending recovery email');
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}
