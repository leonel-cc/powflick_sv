import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateDiscountBodyDto {
  @ApiProperty({
    isArray: true,
    type: String,
    description: 'IDs de los productos en los que aplicar el descuento.',
  })
  @IsArray({
    message:'Se debe enviar los ids en un array de strings',
  })
    productsIds: string[];

  @ApiProperty({
    type: Number,
    minimum: 0,
    maximum: 100,
    description: 'Porcentaje de descuento a aplicar (entre 0 y 100).',
  })
  @IsNotEmpty({
    message: 'El descuento es requerido',
  })
  @IsNumber({}, {
    message: 'Se debe enviar un número',
  })
  @IsInt({
    message: 'Se debe enviar un número entero',
  })
  @Min(0, {
    message: 'El descuento no puede ser menor que 0',
  })
  @Max(100, {
    message: 'El descuento no puede ser mayor que 100',
  })
    discount: number;
}