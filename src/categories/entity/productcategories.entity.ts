import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Product } from '../../products/entity/products.entity';
import { Categories } from './categories.entity';

@Table({})
export class ProductCategories extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true,
  })
    id: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    productId: string;

  @ForeignKey(() => Categories)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    categoryId: string;
}