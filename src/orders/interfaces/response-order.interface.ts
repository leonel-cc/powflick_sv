import { Order } from '../entity/order.entity';

export interface IOrder {
  status: number;
  data: Order | Order[];
}

export interface UpdateStateOrder {
  statusCode: number;
  message: string;
  orderUpdated: Order;
}

export interface IGetOrders {
  statusCode: number;
  data: {
    orders: Order[];
    totalOrders: number;
    totalPages: number;
    prevPage:number;
    page: number;
    nextPage:number;
  };
}
