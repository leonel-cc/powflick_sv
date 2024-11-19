import { IsNotEmpty, IsString } from 'class-validator';
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
}
