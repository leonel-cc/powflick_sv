import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStateEnum } from '../entity/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiProperty({
    type: String,
    format: 'string',
    description: 'id de la orden.',
  })
  @IsNotEmpty({
    message: '$property no puede estar vacío',
  })
    orderId: string;

  @ApiProperty({
    enum: OrderStateEnum,
    description: 'Talle de la prenda.',
    enumName: 'OrderStateEnum',
  })
  @IsString({
    message: '$property debe ser un string, en cambio enviaste: $value',
  })
  @IsNotEmpty({
    message: '$property no puede estar vacio',
  })
    state: OrderStateEnum;


  @ApiProperty({
    type: String,
    format: 'string',
    description: 'ID de la nueva dirección.',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '$property debe ser un string, en cambio enviaste: $value',
  })
    directionId?: string;

  @ApiProperty({
    type: String,
    format: 'string',
    description: 'Nota del cliente.',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '$property debe ser un string, en cambio enviaste: $value',
  })
    note?: string;
}
