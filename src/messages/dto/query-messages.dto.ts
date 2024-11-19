import { IsOptional, IsString, IsEnum, IsBooleanString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContactType } from '../entity/messages.entity';

enum FilterType {
  NAME = 'name',
  EMAIL = 'email',
}

// Función para obtener la descripción de cada categoría
export function getDescription(category: ContactType): string {
  switch (category) {
    case ContactType.ComplaintOrClaim:
      return 'These messages pertain to complaints or claims filed by customers regarding products or services.';
    case ContactType.OrderHelp:
      return 'These messages are requests for assistance or clarification regarding orders placed by customers.';
    case ContactType.PageFunctionalityHelp:
      return 'These messages involve inquiries or feedback related to the functionality or usability of the website or application.';
    case ContactType.GeneralHelp:
      return 'These messages encompass general inquiries or requests for assistance that do not fall into the specific categories mentioned above.';
    default:
      return ''; // Por si acaso, en caso de que se proporcione una categoría no reconocida
  }
}
export class QueryMessagesDto {
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

  @ApiProperty({ name: 'search', required: false, description: 'Valor de atributo a filtrar' })
  @IsOptional({ message: 'Se debe enviar el valor del atributo a filtrar' })
  @IsString()
    search?: string;

  @IsOptional()
  @IsBooleanString({ message: 'El valor de answered debe ser un booleano (true o false)' })
  @ApiProperty({ name: 'answered', required: false, type: Boolean, description: 'Indica si el mensaje ha sido respondido o no' })
    answered: string;

  @IsOptional()
  @IsEnum(ContactType)
  @IsString({ message: 'Se debe enviar una categoria' })
  @ApiProperty({ name: 'category', required: false, enum: ContactType, description: 'category' })
    category?: ContactType;
}
