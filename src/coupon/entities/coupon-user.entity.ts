import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Coupon } from './coupon.entity';
import { User } from '../../users/entity/users.entity';

@Table({
  tableName: 'CouponUser',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class CouponUser extends Model<CouponUser> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
    id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    userId: string;

  @ForeignKey(() => Coupon)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    couponId: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
    active: boolean;

  @BelongsTo(() => User)
    user: User;

  @BelongsTo(() => Coupon)
    coupon: Coupon;
}
