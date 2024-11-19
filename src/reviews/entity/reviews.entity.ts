import {
  Column,
  DataType,
  BelongsTo,
  Model,
  Table,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../users/entity/users.entity';

export enum Rating {
  zero = '0',
  zeroPoint = '0.5',
  one = '1',
  onePoint = '1.5',
  two = '2',
  twoPoint = '2.5',
  three = '3',
  threePoint = '3.5',
  four = '4',
  fourPoint = '4.5',
  five = '5',
}
export enum ReviewType {
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
}
export enum ShowType {
  LANDING = 'LANDING',
  DETAIL = 'DETAIL',
  BOTH = 'BOTH',
}
@Table({
  tableName: 'Reviews',
  underscored: true,
  timestamps: true,
})
export class Review extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
    id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
    title: string;

  @Column(DataType.BOOLEAN)
    isActive: boolean;

  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
    review: string;

  @Column({
    type: DataType.ENUM(...Object.values(Rating)), //['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'],),
    defaultValue: Rating.zero,
    allowNull: false,
  })
    rating: Rating;

  @Column({
    type: DataType.ENUM(...Object.values(ReviewType)),
  })
    type: ReviewType;

  @Column({
    type: DataType.ENUM(...Object.values(ShowType)),
    allowNull: true,
  })
    show: ShowType;

  @Column({
    type: DataType.STRING,
  })
    image: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    userId: string;

  @BelongsTo(() => User)
    user: User;

  @Column({
    type: DataType.INTEGER,
  })
    orderId: string;

  @Column({
    type: DataType.INTEGER,
  })
    productId: string;
}
