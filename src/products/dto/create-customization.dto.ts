import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, ValidateNested,  IsOptional, IsObject, IsArray } from 'class-validator';
import { MaterialsType, NeckType, PantsType, ShortsType, SizeType, SleeveType, SocksType } from '../enum/customization.enum';
import { Type } from 'class-transformer';

export class LogoDto {
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'URL del logo de la prenda.',
  })
  @IsString({
    message: 'La URL del logo debe ser una cadena de caracteres.',
  })
    logoUrl?: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'ID del logotipo de la prenda.',
  })
  @IsString({
    message: 'El ID del logotipo debe ser una cadena de caracteres.',
  })
    logoId?: string;

  @IsOptional()
  @ApiProperty({
    type: Object,
    description: 'Posición del logo de la prenda.',
  })
  @IsObject()
    logoPosition?: { x: number; y: number };

  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Tamaño del logo de la prenda.',
  })
  @IsNumber({}, {
    message: 'El tamaño del logo debe ser un número.',
  })
    logoSize?: number;

  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'rotacion del logo de la prenda.',
  })
  @IsNumber({}, {
    message: 'La rotacion del logo debe ser un número.',
  })
    rotate?: number;
}

export class TextDto {
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Texto de la prenda.',
  })
  @IsString({
    message: 'El texto debe ser una cadena de caracteres.',
  })
    text?: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Fuente del texto de la prenda.',
  })
  @IsString({
    message: 'La fuente debe ser una cadena de caracteres.',
  })
    font?: string;

  @IsOptional()
  @ApiProperty({
    type: Object,
    description: 'Posición del texto de la prenda.',
  })
  @IsObject()
    textPosition?: { x: number; y: number };

  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Tamaño del texto de la prenda.',
  })
  @IsNumber({}, {
    message: 'El tamaño del texto debe ser un número.',
  })
    textSize?: number;

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Color del texto de la prenda.',
  })
  @IsString({
    message: 'El color del texto debe ser una cadena de caracteres.',
  })
    textColor?: string;

  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'rotacion del texto de la prenda.',
  })
  @IsNumber({}, {
    message: 'La rotacion del texto debe ser un número.',
  })
    rotate?: number;
}

export class NumberDto {
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Número de la prenda.',
  })
  @IsString({
    message: 'El número debe ser una cadena de caracteres.',
  })
    number?: string;

  @IsOptional()
  @ApiProperty({
    type: Object,
    description: 'Posición del número de la prenda.',
  })
  @IsObject()
    numberPosition?: { x: number; y: number };

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Fuente del numero de la prenda.',
  })
  @IsString({
    message: 'La fuente debe ser una cadena de caracteres.',
  })
    font?: string;

  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Tamaño del número de la prenda.',
  })
  @IsNumber({}, {
    message: 'El tamaño del número debe ser un número.',
  })
    numberSize?: number;

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Color del número de la prenda.',
  })
  @IsString({
    message: 'El color del número debe ser una cadena de caracteres.',
  })
    numberColor?: string;

  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'rotacion del numero de la prenda.',
  })
  @IsNumber({}, {
    message: 'La rotacion del numero debe ser un número.',
  })
    rotate?: number;
}

export class FrontSideDto {
  @IsOptional()
  @ApiProperty({
    type: [LogoDto],
    description: 'Lista de logotipos de la prenda.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogoDto)
    logos?: LogoDto[];

  @IsOptional()
  @ApiProperty({
    type: [TextDto],
    description: 'Lista de textos de la prenda.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextDto)
    texts?: TextDto[];

  @IsOptional()
  @ApiProperty({
    type: [NumberDto],
    description: 'Lista de números de la prenda.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NumberDto)
    numbers?: NumberDto[];
}



export class CreateCustomizationDto {
  id?: string;

  userId: string;

  productId: string;

  price?: number;

  @ApiProperty({
    enum: SizeType,
    description: 'Talle de la prenda.',
    enumName: 'SizeType',
  })
  @IsEnum(SizeType, {
    message: 'El talle debe ser uno de los valores definidos en la enumeración sizeType.',
  })
    size: SizeType;

  @ApiProperty({
    type: FrontSideDto,
    description: 'Detalles del lado delantero de la prenda.',
  })
  @ValidateNested()
    frontSide: FrontSideDto;

  @ApiProperty({
    type: FrontSideDto,
    description: 'Detalles del lado trasero de la prenda.',
  })
  @ValidateNested()
    backSide: FrontSideDto;

  @IsOptional()
  @ApiProperty({
    enum: SleeveType,
    description: 'Tipo de manga de la prenda.',
    enumName: 'SleeveType',
  })
  @IsEnum(SleeveType, {
    message: 'El tipo de manga debe ser uno de los valores definidos en la enumeración SleeveType.',
  })
    sleeve: SleeveType;

  @IsOptional()
  @ApiProperty({
    enum: SocksType,
    description: 'Color de medias.',
    enumName: 'SocksType',
  })
  @IsEnum(SocksType, {
    message: 'El color de medias debe ser uno de los valores definidos en la enumeración SocksType.',
  })
    socks?: SocksType;

  @IsOptional()
  @ApiProperty({
    enum: PantsType,
    description: 'Color de pantalones.',
    enumName: 'PantsType',
  })
  @IsEnum(PantsType, {
    message: 'El tipo de pantalones debe ser uno de los valores definidos en la enumeración PantsType.',
  })
    pants?: PantsType;

  @IsOptional()
  @ApiProperty({
    enum: ShortsType,
    description: 'Color de shorts.',
    enumName: 'ShortsType',
  })
  @IsEnum(ShortsType, {
    message: 'El tipo de short debe ser uno de los valores definidos en la enumeración ShortsType.',
  })
    shorts?: ShortsType;

  @IsOptional()
  @ApiProperty({
    enum: MaterialsType,
    description: 'Tipo de material.',
    enumName: 'MaterialsType',
  })
  @IsEnum(MaterialsType, {
    message: 'El tipo de material debe ser uno de los valores definidos en la enumeración MaterialsType.',
  })
    materials: MaterialsType;

  @IsOptional()
  @ApiProperty({
    enum: NeckType,
    description: 'Tipo de cuello de la prenda.',
    enumName: 'NeckType',
  })
  @IsEnum(NeckType, {
    message: 'El tipo de cuello debe ser uno de los valores definidos en la enumeración NeckType.',
  })
    neck?: NeckType;

  designName?: string;
}
