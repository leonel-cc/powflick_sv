import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { BREVO_API_KEY } from 'src/config/enviroments';

export class BrevoService {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    const apiKey = SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
    apiKey.apiKey = BREVO_API_KEY; // Reemplaza 'YOUR_API_KEY' con tu clave API de Brevo

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = {
      email: 'support@powflick.com',
      name: 'Powflick Support',
    };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully:', response);
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
  }
}
