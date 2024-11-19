import { Sport } from '../entity/sport.entity';

describe('Sport', () => {
  it('should be defined', () => {
    expect(new Sport()).toBeDefined();
  });
});
