import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsString,
  IsNumber,
} from 'class-validator';
import { FrontCartStore } from '../../shopping-cart/dto/add.bulkCustomizations.dto';
export class CreateOrderDto {
  @IsUUID('4', { message: 'Se debe proporcionar el Id del usuario' })
  @IsOptional({ message: 'El campo $property no debe estar vacio' })
  /*El campo es opcional porque en cierta instancia (controller) no es requerida del body,
  en cambio en el service se indica como tipo de dato del create*/
  userId?: string;

  @ApiProperty({
    type: String,
    format: 'UUID',
    description: 'id de la direccion.',
  })
  @IsUUID('4', {
    message: 'Recuerda mandar el Id de la direccion seleccionada',
  })
  @IsNotEmpty({ message: 'El campo $property no debe estar vacio' })
  directionId: string;

  @IsOptional({ message: 'El campo $coupon puede estar vacio' })
  couponId: string;

  @IsOptional({ message: 'Productos del carrito obtenidos del front' })
  cartProducts: FrontCartStore[];

  @ApiProperty({
    type: String,
    description: 'Nota del cliente.',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '$property debe ser un string, en cambio enviaste: $value',
  })
  note?: string;
}
