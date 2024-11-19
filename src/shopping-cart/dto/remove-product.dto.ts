import { IsString } from 'class-validator';

export class RemoveProductFromCartDto {
  @IsString()
    productId: string;
}