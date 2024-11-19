import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreateCustomizationDto } from '../../products/dto/create-customization.dto';

export class ProductImage {
  @ApiProperty({
    isArray: true,
    type: String,
    format: 'url',
    description: 'IDs de los productos en los que aplicar el descuento.',
  })
  @IsArray({
    message:'Se debe enviar los ids en un array de strings',
  })
    images: string[];

  @ApiProperty({
    type: String,
    description: 'Deporte de la prenda.',
  })
  @IsString({
    message: 'El deporte debe ser un string.',
  })
    sports: string;
}
export class CreatePdfDto {
  @ApiProperty({
    type: CreateCustomizationDto,
    description: 'Detalles del lado frontal de la prenda.',
  })
    customization: CreateCustomizationDto;

  @ApiProperty({
    type: ProductImage,
    description: 'Detalles del lado frontal de la prenda.',
  })
    product: ProductImage;

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Id de la orden.',
  })
  @IsString({
    message: 'Id de la orden.',
  })
    orderId?: string;
}