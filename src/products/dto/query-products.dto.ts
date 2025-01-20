import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export enum OrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
  DATE = 'date',
}

enum GenderEnum {
  Kids = 'Kids',
  Men = 'Men',
  Women = 'Women',
}

enum CategoriesEnum {
  CustomSoccerJerseys = 'Custom Soccer Jerseys',
  GamerShirts = 'Gamer Shirts',
  RunningClothes = 'Running clothes',
  NewArrivals = 'New Arrivals',
  CustomHockeyJerseys = 'Custom Hockey Jerseys',
  CustomBaseballJerseys = 'Custom Baseball Jerseys',
  CustomBasketballJerseys = 'Custom Basketball Jerseys',
}

enum SportEnum {
  Soccer = 'Soccer',
  Gaming = 'Gaming',
  Running = 'Running',
  Hockey = 'Hockey',
  Baseball = 'Baseball',
  Basketball = 'Basketball',
}

enum ColorsEnum {
  Yellow = 'Yellow',
  Blue = 'Blue',
  Black = 'Black',
  Gray = 'Gray',
  Red = 'Red',
  Orange = 'Orange',
  White = 'White',
  Green = 'Green',
  Pink = 'Pink',
  Purple = 'Purple',
  Wine = 'Wine',
  Brown = 'Brown',
}
export class QueryProductsDto {
  @IsNotEmpty({ message: 'El límite no puede estar vacío' })
  @IsString({ message: 'El límite debe ser un string que represente un número entero pasado por query' })
  @ApiProperty({ description: 'Límite de resultados', default: '12' })
    limit: string;

  @IsNotEmpty({ message: 'La página no puede estar vacía' })
  @IsString({ message: 'La página debe ser un string que represente un número entero pasado por query' })
  @ApiProperty({ description: 'Pagina de resultados', default: '1' })
    page: string;

  @IsOptional()
  @IsEnum(OrderEnum)
  @IsString({ message: 'Ordenamiento de productos por precio' })
  @ApiProperty({ name: 'order', required: false, enum: OrderEnum, description: 'Ordenamiento por precio' })
    order?: OrderEnum;

  @IsOptional()
  @IsString({ message: 'Color a filtrar debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'color', required: false, enum: ColorsEnum, description: 'Color' })
    color?: ColorsEnum;

  @IsOptional()
  @IsString({ message: 'Segundo color a filtrar debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'segundo color', required: false, enum: ColorsEnum, description: 'Color2' })
    color2?: ColorsEnum;

  @IsOptional()
  @IsString({ message: 'El valor mínimo de precio debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'minPrice', required: false, type: String, description: 'Precio mínimo' })
    minPrice?: string;

  @IsOptional()
  @IsString({ message: 'El valor máximo de precio debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'maxPrice', required: false, type: String, description: 'Precio máximo' })
    maxPrice?: string;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'category', required: false, enum: CategoriesEnum, description: 'Categoría' })
    category?: CategoriesEnum;

  @IsOptional()
  @IsString({ message: 'El genero debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'gender', required: false, enum: GenderEnum, description: 'Genero' })
    gender?: GenderEnum;

  @IsOptional()
  @IsString({ message: 'El deporte debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'sport', required: false, enum: SportEnum, description: 'Deporte' })
    sport?: SportEnum;

  @IsOptional()
  @ApiProperty({ name:'featured', required: false, type: Boolean, description: 'Destacados' })
    featured?: string;

  @IsOptional()
  @ApiProperty({ name:'mostSold', required: false, type: Boolean, description: 'Mas Vendidos' })
    mostSold?: string;

  @IsOptional()
  @ApiProperty({ name:'discount', required: false, type: Boolean, description: 'Con Descuento' })
    discount?: string;

  @IsOptional()
  @IsString({ message: 'El valor de búsqueda debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'search', required: false, description: 'Valor de atributo a filtrar' })
    search?: string;

  @IsOptional()
  @IsString({ message: 'La colección debe ser una cadena de caracteres' })
  @ApiProperty({ name: 'collection', required: false, description: 'Colección' })
    collection?: string;

  @IsOptional()
  @ApiProperty({ name:'status', required: false, type: String, description: 'Estado del producto' })
    status?: string;
}