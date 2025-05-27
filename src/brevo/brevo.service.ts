import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { BREVO_API_KEY, SERVER_URL } from 'src/config/enviroments';
import * as fs from 'fs';
import * as path from 'path';
import * as pug from 'pug';

export class BrevoService {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    const apiKey = SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
    apiKey.apiKey = BREVO_API_KEY;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendEmail({
    to,
    subject,
    template,
    context,
    attachments = [],
  }: {
    to: string;
    subject: string;
    template: string | number;
    context: any;
    attachments?: Array<{
      url?: string;
      name?: string;
      cid?: string;
      content?: string | Buffer;
    }>;
  }) {
    // Si template es un número, usar plantilla Brevo
    if (typeof template === 'number') {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.sender = {
        email: 'support@powflick.com',
        name: 'Powflick Support',
      };
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.templateId = template;
      sendSmtpEmail.params = context;
      if (attachments.length > 0) {
        sendSmtpEmail.attachment = attachments.map((att) => ({
          content:
            typeof att.content === 'string'
              ? att.content
              : att.content?.toString('base64'),
          name: att.name,
        }));
      }
      try {
        const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully (brevo template):', response);
        return response;
      } catch (error) {
        console.error('Error sending email (brevo template):', error.message);
        throw error;
      }
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = {
      email: 'support@powflick.com',
      name: 'Powflick Support',
    };
    sendSmtpEmail.subject = subject;

    const htmlContent = await this.renderTemplate(template, context);
    const { processedHtmlContent, processedAttachments } =
      await this.processAttachments(attachments, htmlContent);

    sendSmtpEmail.htmlContent = processedHtmlContent;
    if (processedAttachments.length > 0) {
      sendSmtpEmail.attachment = processedAttachments;
    }

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw error;
    }
  }

  private async renderTemplate(
    templatePath: string,
    context: any,
  ): Promise<string> {
    try {
      const fullTemplatePath = path.resolve(
        process.cwd(),
        `src/mail/templates/${templatePath}.pug`,
      );
      return pug.renderFile(fullTemplatePath, context);
    } catch (error) {
      console.error(`Error rendering template ${templatePath}:`, error);
      return this.getFallbackHtml(context);
    }
  }

  private async processAttachments(attachments: any[], htmlContent: string) {
    const processedAttachments = [];
    let processedHtmlContent = htmlContent;

    for (const attachment of attachments) {
      if (attachment.content) {
        processedAttachments.push({
          content:
            typeof attachment.content === 'string'
              ? attachment.content
              : attachment.content.toString('base64'),
          name: attachment.name || attachment.filename,
        });
      } else if (attachment.url) {
        try {
          const filePath = path.resolve(
            attachment.url.replace(SERVER_URL, './src/public'),
          );
          const content = fs.readFileSync(filePath).toString('base64');
          const contentId =
            attachment.cid || this.getContentId(attachment.name);
          const formattedContentId = contentId.includes('@')
            ? contentId
            : `${contentId}@brevo.com`;

          processedAttachments.push({
            content: content,
            name: attachment.name,
            disposition: 'inline',
            content_id: formattedContentId,
          });

          const cidRegex = new RegExp(`cid:${contentId}(?!@)`, 'g');
          processedHtmlContent = processedHtmlContent.replace(
            cidRegex,
            `cid:${formattedContentId}`,
          );
        } catch (error) {
          console.error(`Error reading file ${attachment.url}:`, error);
        }
      }
    }

    return { processedHtmlContent, processedAttachments };
  }

  private getContentId(filename: string): string {
    const name = path.basename(filename, path.extname(filename));
    const cidMap = {
      TheSports: 'headerTheSportsLogo',
      TheSportsLogo: 'headerTheSportsLogo',
      Welcome: 'welcomeImage',
      EMAILS_SPORTS_WELCOME: 'teamImage',
      'EMAILS_REQUEST-10': 'requestImage',
      appstore: 'appImage',
      googleplay: 'googleImage',
      facebook: 'facebookImage',
      instagram: 'instagramImage',
      pinterest: 'pinterestImage',
    };
    return cidMap[name] || name;
  }

  private getFallbackHtml(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Correo de TheSports</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>TheSports</h1>
        <p>Hola ${context.name || 'Usuario'}!</p>
        <p>Ocurrió un problema al generar este correo.</p>
        <p>Por favor, contacta con nuestro equipo de soporte.</p>
      </body>
      </html>
    `;
  }
}
