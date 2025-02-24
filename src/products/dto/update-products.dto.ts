import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsBoolean, IsArray, ArrayUnique, IsUrl, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StateProduct } from '../entity/products.entity';

export class UpdateProductDto {
  @IsOptional()
  @IsNotEmpty({
    message: 'El título del producto es obligatorio.',
  })
  @IsString({
    message: 'El título del producto debe ser una cadena de caracteres.',
  })
  @ApiProperty({ description: 'Título del producto.' })
    title?: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'El slug del producto es obligatorio.',
  })
  @IsString({
    message: 'El slug del producto debe ser una cadena de caracteres.',
  })
  @ApiProperty({ description: 'Slug del producto.' })
    slug?: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'El contenido del producto es obligatorio.',
  })
  @IsString({
    message: 'El contenido del producto debe ser una cadena de caracteres.',
  })
  @ApiProperty({ description: 'Contenido del producto.' })
    content?: string;

  @IsOptional()
  @IsString({
    message: 'La descripción corta del producto debe ser una cadena de caracteres.',
  })
  @ApiProperty({ description: 'Descripción corta del producto.' })
    short_description?: string;

  @IsOptional()
  @IsDateString({}, {
    message: 'La fecha del producto debe ser una cadena de caracteres con formato de fecha.',
  })
  @ApiProperty({ description: 'Fecha del producto.' })
    date?: string;

  @IsOptional()
  @IsInt({
    message: 'El stock del producto debe ser un número entero.',
  })
  @ApiProperty({ description: 'Stock del producto.' })
    stock?: number;

  @IsOptional()
  @IsNumber({}, {
    message: 'El precio regular del producto debe ser un número.',
  })
  @ApiProperty({ description: 'Precio regular del producto.' })
    regular_price?: number;

  @IsOptional()
  @IsString({
    message: 'El estado del stock del producto debe ser una cadena de caracteres.',
  })
  @ApiProperty({ description: 'Estado del stock del producto.' })
    stock_status?: string;

  @IsOptional()
  @IsString({
    message: 'El slug del producto debe ser una cadena de caracteres.',
  })
  @ApiProperty({ description: 'Slugdel producto.' })
    slug?: string;

  @IsOptional()
  @IsUrl({}, {
    message: 'La URL del producto debe ser una URL válida.',
  })
  @ApiProperty({ description: 'URL del producto.' })
    URL?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ApiProperty({ description: 'Categorías del producto.' })
    product_categories?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ApiProperty({ description: 'Géneros del producto.' })
    genders?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Deportes del producto.' })
    sports?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ApiProperty({ description: 'Colores del producto.' })
    colors?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ApiProperty({ description: 'Imágenes del producto.' })
    images?: string[];

  @IsOptional()
  @ApiProperty({ description: 'Producto destacado.' })
    featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Mas vendido.' })
    mostSold?: boolean;

  @IsOptional()
  @IsEnum(StateProduct, {
    message: 'El estado del producto debe ser "publish" o "draft".',
  })
  @ApiProperty({ description: 'Estado del producto.', enum: StateProduct })
    status?: StateProduct;

  @IsOptional()
  @IsString({
    message: 'El ID del deporte del producto debe ser una cadena de caracteres.',
  })
  @ApiProperty({ description: 'ID del deporte del producto.' })
    sportId?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Descuento del producto.' })
    discount?: number;

  @IsOptional()
  @IsArray()
  @ApiProperty({ description: 'colleccion del producto.' })
    collections?: string[];
}