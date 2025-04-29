import {
  AfterCreate,
  BeforeCreate,
  BeforeDestroy,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Direction } from '../../directions/entity/directions.entity';
import { Customization } from '../../products/entity/customization.entity';
import { Product } from '../../products/entity/products.entity';
import { UserProductFav } from './userproductfav.entity';
import { Review } from '../../reviews/entity/reviews.entity';
import { Order } from '../../orders/entity/order.entity';
import { CouponUser } from '../../coupon/entities/coupon-user.entity';

export enum Rol {
  superAdmin = 'superAdmin',
  admin = 'admin',
  user = 'user',
}

export enum UserProviders {
  none = 'none',
  google = 'google',
  facebook = 'facebook',
}

@Table({
  tableName: 'Users',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  @BeforeCreate
  static async setActive(instance: User) {
    instance.isActive = true;
  }

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
  })
  phone: string | null;

  @Column({
    type: DataType.STRING,
  })
  image: string;

  @Column({
    type: DataType.STRING,
    defaultValue: UserProviders.none,
    allowNull: false,
  })
  provider: UserProviders;

  @Column({
    type: DataType.STRING,
    defaultValue: Rol.user,
    allowNull: false,
  })
  rol: Rol;

  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @HasMany(() => Direction, { onDelete: 'CASCADE', hooks: true })
  directions: Direction[];

  @HasMany(() => Order)
  orders: Order[];

  @BelongsToMany(() => Product, () => UserProductFav)
  favorites: Product[];

  @HasMany(() => Customization)
  customizations: Customization;

  @HasMany(() => Review)
  reviews: Review[];

  @HasMany(() => CouponUser)
  couponUsers: CouponUser[];
}
