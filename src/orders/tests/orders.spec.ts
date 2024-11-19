import { Order } from '../entity/order.entity';

describe('Orders', () => {
  it('should be defined', () => {
    expect(new Order()).toBeDefined();
  });
});
