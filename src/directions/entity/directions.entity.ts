import {
  Column,
  Model,
  DataType,
  Table,
  BelongsTo,
  ForeignKey,
  BeforeCreate,
} from 'sequelize-typescript';
import { User } from '../../users/entity/users.entity';
// import { Order } from '../orders/entities/order.entity';
@Table({
  tableName: 'Directions',
  timestamps: true,
  underscored: true,
  paranoid: true,
})
export class Direction extends Model<Direction> {
  @BeforeCreate
  static async setPhone(instance: Direction) {
    if (!instance.phone) {
      const thisPhoneNumber = await User.findByPk(instance.userId);
      instance.phone = thisPhoneNumber.phone;
    }
  }

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
    id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    country: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    city: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    district: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    addressReference?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    postalCode?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    neighborhood?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    phone?: string;

  //   @HasMany(() => Order)
  //     orders: Order[];

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
    userId: string;

  @BelongsTo(() => User)
    user: User;
}
