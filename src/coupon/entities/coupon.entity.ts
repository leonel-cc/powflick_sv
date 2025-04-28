import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { CouponUser } from './coupon-user.entity';

@Table({
  tableName: 'Coupon',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Coupon extends Model<Coupon> {
  @ApiProperty()
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  content: string;

  @ApiProperty()
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  discount: number;

  @ApiProperty()
  @Column({
    type: DataType.ENUM('percent', 'amount'),
    allowNull: false,
    defaultValue: 'percent',
  })
  type: 'percent' | 'amount';

  @HasMany(() => CouponUser, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  couponUsers: CouponUser[];
}
