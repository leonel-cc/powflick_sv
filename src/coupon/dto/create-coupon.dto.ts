import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCouponDto {
  @IsOptional()
  @IsUUID()
    id: string;

  @IsNotEmpty()
  @IsString()
    title: string;

  @IsNotEmpty()
  @IsString()
    content: string;

  @IsNotEmpty()
  @IsNumber()
    discount: number;
}
