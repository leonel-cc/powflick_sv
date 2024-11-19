import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDirectionDto {
  @IsUUID('4')
  @IsNotEmpty({
    message: 'Debe mandar el Id de la dirección la cual quiere actualizar.',
  })
  @IsString({
    message: 'El Id de la dirección debe ser una string de tipo UUID',
  })
  @ApiProperty({ description: 'Id de la dirección a actualizar.' })
    id: string;

  @IsOptional({ always: true })
  @IsNotEmpty({ message: 'Debe agregar un pais' })
  @IsString({ message: 'El pais debe ser un string' })
  @ApiProperty({ description: 'pais' })
    country?: string;

  @IsOptional({ always: true })
  @IsString({ message: 'La ciudad debe ser un string' })
  @ApiProperty({ description: 'Ciudad' })
    city?: string;

  @IsOptional({ always: true })
  @IsString({ message: 'El estado debe ser un string' })
  @ApiProperty({ description: 'Estado' })
    district?: string;

  @IsOptional({ always: true })
  @IsString({ message: 'La dirección debe ser un string' })
  @ApiProperty({ description: 'Calle' })
    address?: string;

  @IsOptional({ always: true })
  @IsString({
    message:
      'La propiedad "Referencia de la dirección" debe ser de tipo string',
  })
  @ApiProperty({
    description:
      'Debe contener una descripción de referencia sobre la dirección, teniendo en cuenta datos como\n- Numero de departamento\n- Altura\n- piso\nEntre otros datos que considere importante',
    nullable: true,
  })
    addressReference?: string;

  @IsOptional({ always: true })
  @IsString({
    message:
      'El codigo postal debe ser de tipo string',
  })
  @ApiProperty({
    description:
      'Debe ser un codigo postal valido en referencia a la zona',
    nullable: true,
  })
    postalCode?: string;

  @IsOptional({ always: true })
  @IsString({ message: 'La propiedad "barrio" debe ser de tipo string' })
  @ApiProperty({
    description:
      'Debe contener el nombre del barrio al que el usuario pertenece como parte de la descripción de su dirección',
    nullable: true,
  })
    neighborhood?: string;

  @IsOptional({ always: true })
  @IsString({ message: 'La propiedad "phone" debe ser de tipo string' })
  @ApiProperty({
    description:
      'Debe contener el numero de telefono del usuario o perteneciente e la ubicación.\nDe no pasarle nada, el se completa con el numero del usuario',
    nullable: true,
  })
    phone?: string;
}
