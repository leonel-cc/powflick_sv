import { IsString, IsArray } from 'class-validator';
import { CreateCustomizationDto } from 'src/products/dto/create-customization.dto';

export class BulkCustomizationsToProductCartDto {
  @IsString()
    productId: string;

  @IsArray()
    customizations: CreateCustomizationDto[];
}
