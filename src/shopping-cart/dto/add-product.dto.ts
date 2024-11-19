import { IsString, IsArray } from 'class-validator';

export class AddProductToCartDto {
  @IsString()
    productId: string;

  @IsArray()
  @IsString({ each: true })
    customizationsId: string[];
}
