import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewType, Rating, ShowType } from '../entity/reviews.entity';
export class GetAllReviewsDto {
  @IsNotEmpty({
    message: '$property no debe estar vacío',
  })
  @IsString({ message: 'la propiedad $property debe ser un número' })
  @ApiProperty({ description: 'Límite de resultados', default: '12' })
    limit: string;

  @IsNotEmpty({
    message: '$property no debe estar vacío',
  })
  @IsString({ message: 'la propiedad $property debe ser un número' })
  @ApiProperty({ description: 'Página de resultados', default: '1' })
    page: string;

  @IsOptional()
  @IsNotEmpty({
    message: '$property no debe estar vacío',
  })
  @IsEnum(ReviewType, {
    message: 'El tipo de revisión debe ser uno de los valores definidos en la enumeración ReviewType.',
  })
  @IsString({
    message: 'la propiedad $property debe ser un tipo de revisión',
  })
  @ApiProperty({ name: 'type', required: false, enum: ReviewType, description: 'Filtrar por tipo de revisión' })
    type: string;

  @IsOptional()
  @IsEnum(ShowType, {
    message: 'El tipo de vista debe ser uno de los valores definidos en la enumeración ShowType.',
  })
  @IsString({
    message: 'la propiedad $property debe ser un tipo de revisión',
  })
  @ApiProperty({ name: 'type', required: false, enum: ShowType, description: 'Filtrar por detail o landing' })
    show: string;

  @IsOptional()
  @IsEnum(Rating)
  @IsString({
    message: 'la propiedad $property debe contener uno de los valores definidos en la enumeración Rating',
  })
  @ApiProperty({ name: 'rating', required: true, enum: Rating, description: 'Filtrar por calificación' })
    rating: string;

  @IsOptional()
  @IsNotEmpty({
    message: '$property no debe estar vacío',
  })
  @IsEnum(['true', 'false'])
  @ApiProperty({ name: 'isActive', required: false, enum: ['true', 'false'], description: 'Filtrar por estado de activación' })
    isActive: string;

  @ApiProperty({ name: 'search', required: false, description: 'Buscar por nombre de producto' })
  @IsOptional({ message: 'Se debe enviar el nombre del producto' })
  @IsString()
    search?: string;
}