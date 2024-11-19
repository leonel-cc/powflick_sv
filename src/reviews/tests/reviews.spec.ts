import { Review } from '../entity/reviews.entity';

describe('Reviews', () => {
  it('should be defined', () => {
    expect(new Review()).toBeDefined();
  });
});
