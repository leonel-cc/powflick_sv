import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Rating, ShowType } from '../entity/reviews.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  //userId
  @ApiProperty({
    description:
      'id de la reseña a desactivar o activar. Debe ser de tipo UUIDV4',
    type: 'string',
  })
  @IsString({
    message: 'se debe enviar el atributo "reviewId"',
  })
    reviewId: string;

  //review
  @ApiProperty({
    description:
      'Lo que sería la reseña en sí, aquí va escrita la opinión del usuario. Debe tener entre 10 y 500 caracteres',
  })
  @IsOptional()
  @IsString({
    message: '$property debe ser un string',
  })
  @IsNotEmpty({
    message: '$property no debe estar vacío',
  })
  @MinLength(10, {
    message:
      '$property is too short, minumum length must be $constraint1, but actual is $value',
  })
  @MaxLength(500, {
    message:
      '$property is too long, maximum length must be $constraint1, but actual is $value',
  })
    review: string;

  //rating
  @ApiProperty({
    enum: ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'],
    description:
      'Valor númerico de que solo admite cierto valores según un enum. /nEstos valores van desde el 0 al 5, pasando por los valores intermedios',
    example: '4.5',
  })
  @IsOptional()
  @IsString({
    message: '$property debe ser un string',
  })
  @IsNotEmpty({
    message: '$property no debe estar vacío',
  })
  @IsEnum(Rating, {
    message: '$value no es un valor permitido, prueba con $constraint1',
  })
    rating: Rating;

  @IsOptional()
  @IsBoolean({
    message:'$property debe ser de tipo booleano, en cambio enviaste $value',
  })
    isActive:boolean;

  //type
  @IsOptional()
  @ApiProperty({
    enum: Object.values(ShowType),
    description:
      'Donde se muestran las reviews, aqui es donde se elige en que pagina mostrar la review.',
    example: 'LANDING',
  })
  @IsString({
    message: '$property debe ser un string',
  })
  @IsEnum(ShowType, {
    message:
      'Hay un número limitado de valores permitidos para $property y $value no lo es',
  })
    show: ShowType;

}
