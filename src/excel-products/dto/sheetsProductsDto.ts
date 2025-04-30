import { IsNotEmpty, IsString, IsDateString, IsNumber, IsEnum, IsUrl, IsBoolean, IsOptional, IsEmpty, ValidateIf } from 'class-validator';

import { StateProduct } from '../../products/entity/products.entity';
import { Transform } from 'class-transformer';
import { Optional } from '@nestjs/common';

export class SheetsProductsDto {
  @IsNotEmpty()
  @IsString()
    ID: string;

  @IsNotEmpty()
  @IsString()
    Title: string;

  @IsNotEmpty()
  @IsString()
    Content: string;

  @IsOptional()
  @Transform(({ value }) => value === null ? '' : value) // Transformamos null a cadena vacía
  @IsString()
    'Short Description': string;

  @IsNotEmpty()
  @IsString()
    Date: string;

  @IsNotEmpty()
  @IsString()
    'Regular Price': string;

  @IsNotEmpty()
  @IsString()
    'Stock Status': string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10)) // Aquí se transforma el valor
    Stock: string;

  @IsOptional()
  @IsString()
    'Product Categories': string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === null ? '' : value) // Transformamos null a cadena vacía
    'Product Collections': string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === null ? '' : value) // Transformamos null a cadena vacía
    Tags: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === undefined || value === null || value === '' ? '1000' : value)
    Score: string;

  @IsNotEmpty()
  @IsString()
    Genders: string;

  @IsNotEmpty()
  @IsString()
    Sports: string;

  @IsOptional()
  @IsString({ each: true }) // Valida que cada elemento del array sea un string
  @Transform(({ value }) => value === null ? [] : value.split('|')) // Realiza la transformación del string a un array
    Colors: string[];

  @IsNotEmpty()
  @IsEnum(StateProduct)
    Status: StateProduct;

  @IsNotEmpty()
  @IsString()
    Slug: string;

  @IsNotEmpty()
  @Transform(({ value }) => value === 'yes')  // Convierte 'yes' en true y cualquier otra cosa en false
    Featured: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === undefined || value === null || value === '' ? 'Arial' : value)
    Font: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === undefined || value === null || value === '' ? '%ffffff' : value)
    'Font Color': string;

  @IsOptional()
  @IsString()
    sportId?: string;

  static getDescription(): string {
    return `
      ID: identificador único del producto.\n
      Title: título del producto.\n
      Content: descripción detallada del producto.\n
      Short Description: descripción corta del producto.\n
      Date: fecha del producto.\n
      Price: precio actual del producto.\n
      Regular Price: precio regular del producto.\n
      Stock Status: estado del stock del producto.\n
      Stock: cantidad de stock disponible del producto.\n
      Product Categories: categorías a las que pertenece el producto. (puede enviarse mas de uno en este formato "New Arrival|Gamer Shirt")\n
      Product Collections: collection a las que pertenece el producto. (puede enviarse mas de uno en este formato "New Arrival|Gamer Shirt")\n
      Tags: tags delproducto. (puede enviarse mas de uno en este formato "New Arrival|Gamer Shirt")\n
      Genders: género del producto.\n
      Sports: deporte al que pertenece el producto.\n
      Colors: colores disponibles para el producto. (puede enviarse mas de uno en este formato "Red|Blue")\n
      Images: imagenes para el detalle del producto. (puede enviarse mas de uno en este formato "Imagen1.png|Imagen2")\n
      Slug: nombre alternativo para diferenciar las ordenes.\n
      Status: estado del producto (Activo/Inactivo).\n
      URL: URL de la imagen del producto.\n
      Featured: indicador de si el producto está destacado.\n
      Font: fuente del diseño del producto.\n
    `;
  }

}