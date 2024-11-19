import {
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateCouponUserDto {
  @IsOptional()
  @IsUUID()
    id: string;

  @IsOptional()
  @IsUUID()
    userId: string;

  @IsOptional()
  @IsUUID()
    couponId: string;

  @IsOptional()
  @IsBoolean()
    active: boolean;
}
