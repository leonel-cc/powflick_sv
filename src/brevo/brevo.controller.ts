import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BrevoService } from './brevo.service';
import { CreateBrevoDto } from './dto/create-brevo.dto';
import { UpdateBrevoDto } from './dto/update-brevo.dto';

@Controller('brevo')
export class BrevoController {
  constructor(private readonly brevoService: BrevoService) {}

  @Post()
  async create(@Body() createBrevoDto: CreateBrevoDto) {
    const { to, subject, htmlContent } = createBrevoDto;
    return this.brevoService.sendEmail(to, subject, htmlContent);
  }
}
