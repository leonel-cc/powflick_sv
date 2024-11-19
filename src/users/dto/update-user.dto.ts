import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEmpty } from 'class-validator';
import { User } from '../entity/users.entity';

export class UpdateUserDto extends User {
  @IsOptional()
  @IsString({ message: '$property debe ser un string' })
  @ApiProperty({
    description:
      'Recibe el $property del usuario y verifica si es un string. Opcional',
  })
    firstName: string;

  @IsOptional()
  @IsString({ message: '$property debe ser un string' })
  @ApiProperty({
    description:
      'Recibe el $property del usuario y verifica si es un string. Opcional',
  })
    lastName: string;

  @IsOptional()
  @IsString({ message: '$property debe ser un string' })
  @IsEmail(undefined, { message: 'formato de $property invalido' })
  @ApiProperty({
    description:
      'Recibe el $property del usuario y verifica si es el formato adecuado. Opcional',
  })
    email: string;

  @IsOptional()
  @IsString({ message: '$property debe ser un string' })
  @ApiProperty({
    description:
      'Recibe el $property del usuario y verifica si es el formato adecuado. Opcional',
  })
    phone: string;

  @IsEmpty({ message: 'no debe enviarse password' })
    password: string;
}
