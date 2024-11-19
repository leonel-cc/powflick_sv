import { IsString, IsInt, IsPositive } from 'class-validator';

export class UpdateProductQuantityDto {
  @IsString()
    cartProductId: string;

  @IsInt()
  @IsPositive()
    amount: number;
}
