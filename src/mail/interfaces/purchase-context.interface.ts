import { CreateDirectionDto } from '../../directions/dto/create-direetion.dto';
import { User } from '../../users/entity/users.entity';

export interface IPurchaseContext {
  name: string;
  order: string;
  products: {
    productName: string;
    price: number;
    amount: number;
    imageURL: string;
    customizationData: {
      index: number;
      text: string;
      number: number;
    }[];
  }[];
  currencySymbol: string;
  direction?: CreateDirectionDto;
  user?: User;
  purchaseDate?: string;
  cuotes?: number;
  cuotesValue?: number;
  total: number;
}
