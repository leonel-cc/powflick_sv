import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from '../../products/entity/products.entity';
import { User } from './users.entity';

@Table({
  tableName: 'UserProductFav',
  timestamps: false,
  underscored: true,
})
export class UserProductFav extends Model<UserProductFav> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true,
  })
    id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
    userId: string;

  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
  })
    productId: string;

  @BelongsTo(() => Product)
    product: Product;
}
