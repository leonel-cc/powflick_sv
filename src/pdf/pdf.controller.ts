// pdf.controller.ts

import { Body, Controller, Post, Res } from '@nestjs/common';

import { PdfService } from './pdf.service';
import { Response } from 'express';
import { CreatePdfDto } from './dto/create-pdf.dto';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) { }

  @Post()
  async generatePdf(@Body() { customization, product, orderId }: CreatePdfDto, @Res() res: Response) {
    const pdfBuffer = await this.pdfService.generatePdf(customization, product, orderId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');
    res.send(pdfBuffer);
  }

  @Post('/buffer')
  async generatePdfBuffer(@Body() { customization, product, orderId }: CreatePdfDto, @Res() res: Response) {
    const pdfBuffer = await this.pdfService.generatePdf(customization, product, orderId);
    res.json(pdfBuffer);
  }
}
