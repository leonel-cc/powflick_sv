import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UpdateMostSoldBodyDto {
  @ApiProperty({
    isArray: true,
    type: String,
    description: 'IDs de los productos en los que aplicar el descuento.',
  })
  @IsArray({
    message:'Se debe enviar los ids en un array de strings',
  })
    productsIds: string[];
}