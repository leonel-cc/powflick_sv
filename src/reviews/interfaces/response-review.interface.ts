import { Review } from '../entity/reviews.entity';

export interface IReview {
  statusCode: number;
  data?: Review | Review[];
  message?: string;
  reviewUpdated?: Review
}
