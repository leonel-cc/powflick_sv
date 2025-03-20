import { PartialType } from '@nestjs/swagger';
import { CreateBrevoDto } from './create-brevo.dto';

export class UpdateBrevoDto extends PartialType(CreateBrevoDto) {}
