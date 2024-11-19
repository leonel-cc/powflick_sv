import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../entity/users.entity';

enum FilterType {
  nombre = 'firstName',
  apellido = 'lastName',
  email = 'email',
  telefono = 'phone',
}

enum ActiveType {
  todos = 'all',
  active = 'active',
  inactive = 'inactive',
}

enum RolType {
  todos = 'all',
  user = 'user',
  admin = 'admin',
}

export class QueryUsersDto {
  @IsNotEmpty({ message: 'El límite no puede estar vacío' })
  @IsString({
    message: 'El límite debe ser un string que sea un número entero pasado por query',
  })
  @ApiProperty({ description: 'Límite de resultados', default: '12' })
    limit: string;

  @IsNotEmpty({ message: 'La página no puede estar vacía' })
  @IsString({
    message: 'La página debe ser un string que sea un número entero pasado por query',
  })
  @ApiProperty({ description: 'Página de resultados', default: '1' })
    page: string;

  @IsOptional()
  @IsString({ message: 'Si desea que retorne de manera descendente active este parametro(true)' })
  @ApiProperty({ name: 'desc', required: false, type: Boolean, description: 'Orden Descendente' })
    desc?: string;

  @IsOptional()
  @IsEnum(FilterType)
  @IsString({ message: 'Se debe enviar un atributo existente' })
  @ApiProperty({ name: 'filter', required: false, enum: FilterType, description: 'Filtro' })
    filter?: FilterType;

  @IsOptional()
  @IsEnum(RolType)
  @IsString({ message: 'Se debe enviar un rol existente' })
  @ApiProperty({ name: 'rol', required: false, enum: RolType, description: 'rolType' })
    role?: RolType;

  @IsOptional()
  @IsEnum(ActiveType)
  @IsString({ message: 'Se debe enviar activo o inactivo' })
  @ApiProperty({ name: 'isActive', required: false, enum: FilterType, description: 'isActive' })
    isActive?: ActiveType;

  @ApiProperty({ name: 'search', required: false, description: 'Valor de atributo a filtrar' })
  @IsOptional({ message: 'Se debe enviar el valor del atributo a filtrar' })
  @IsString()
    search?: string;
}
