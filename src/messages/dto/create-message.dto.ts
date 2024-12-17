// create-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ContactType } from '../entity/messages.entity';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
    email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    message: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    title: string;

  @IsOptional()
  @ApiProperty({
    enum: ContactType,
    description: 'Tipo de peticion.',
    enumName: 'ContactType',
  })
  @IsEnum(ContactType, {
    message: 'El tipo de peticion debe ser uno de los valores definidos en la enumeración ContactType.',
  })
    category: ContactType;
}
