import { Product } from '../entity/products.entity';

describe('Products', () => {
  it('should be defined', () => {
    expect(new Product()).toBeDefined();
  });
});
