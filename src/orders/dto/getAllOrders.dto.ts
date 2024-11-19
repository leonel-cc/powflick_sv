import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStateEnum } from '../entity/order.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrderEnum } from '../../products/dto/query-products.dto';

export enum SearchByEnum {
  User = 'USER',
  Product = 'PRODUCT',
}

export class GetAllOrdersDto {
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
  @IsEnum(OrderStateEnum, {
    message: 'El talle debe ser uno de los valores definidos en la enumeración OrderStateEnum.',
  })
  @IsString({
    message: 'la propiedad $property debe ser un tipo de estado de las órdenes',
  })
  @ApiProperty({ name: 'status', required: false, enum: OrderStateEnum, description: 'Filtrar por estado' })
    status: string;

  @IsNotEmpty({
    message: '$property no debe estar vacío',
  })
  @IsEnum(OrderEnum)
  @IsString({
    message: 'la propiedad $property contener "ASC" o "DESC" acorde al tipo de orden que requiera',
  })
  @ApiProperty({ name: 'order', required: true, enum: OrderEnum, description: 'Ordenamiento por precio' })
    order: string;

  @IsOptional()
  @IsEnum(SearchByEnum)
  @ApiProperty({ name: 'searchBy', required: false, enum: SearchByEnum, description: 'Especificar si la búsqueda es por usuario o por producto' })
    searchBy?: SearchByEnum;

  @IsOptional()
  @IsString({ message: 'la propiedad $property debe ser una cadena de texto' })
  @ApiProperty({ name: 'searchTerm', required: false, description: 'Término de búsqueda por nombre de usuario o nombre del producto' })
    searchTerm?: string;
}
