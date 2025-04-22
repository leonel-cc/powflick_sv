import { IsString, IsArray } from 'class-validator';
import { CreateCustomizationDto } from '../../products/dto/create-customization.dto';
import { Customization } from '../../products/entity/customization.entity';
import { Product } from '../../products/entity/products.entity';

export class FrontCartStore {
  product: any;

  customizations: Customization[];

  amount: number;

  totalProduct: number;

  totalCustomization: number;
}
