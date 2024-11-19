import { Response } from '../../products/interface/serviceInterfaces';
import { Direction } from '../entity/directions.entity';

export interface IResDirection extends Response {
  direction?: Direction | Direction[];
}
