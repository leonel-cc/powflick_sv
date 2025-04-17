import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEmail,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString() line1: string;

  @IsString() line2: string;

  @IsString() country: string;

  @IsString() city: string;

  @IsString() state: string;

  @IsString() postal_code: string;

  @IsString() district: string;
}

export class ShippingDto {
  @IsString() first_name: string;

  @IsString() last_name: string;

  @IsString() name: string;

  @IsString() phone: string;

  @IsString() cycle: string;

  @ValidateNested()
  @Type(() => AddressDto)
    address: AddressDto;
}

export class ProductDto {
  @IsString() product_id: string;

  @IsString() name: string;

  @IsString() description: string;

  @IsNumber() price: number;

  @IsNumber() quantity: number;

  @IsString() category: string;

  @IsString() sku: string;

  @IsString() url: string;

  @IsString() shipping_provider: string;
}

export class CustomerDto {
  @IsString() customer_type: string;

  @IsString() first_name: string;

  @IsString() last_name: string;

  @IsString() full_name: string;

  @IsString() gender: string;

  @IsEmail() email: string;

  @IsString() phone: string;

  @ValidateNested()
  @Type(() => AddressDto)
    address: AddressDto;
}

export class CreateLlpPaymentDto {
  @IsNumber() order_amount: number;

  @IsString() order_currency_code: string;

  @IsString() order_description: string;

  @ValidateNested()
  @Type(() => ShippingDto)
    shipping: ShippingDto;

  @ValidateNested()
  @Type(() => CustomerDto)
    customer: CustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
    products: ProductDto[];
}
