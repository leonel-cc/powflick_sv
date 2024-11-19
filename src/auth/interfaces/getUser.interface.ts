import { Rol } from '../../users/entity/users.entity';

export interface IGetUser {
  userId?: string;
  userEmail?: string;
  rol?: Rol;
}
