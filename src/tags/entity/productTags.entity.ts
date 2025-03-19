import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { Tags } from './tags.entity';
import { Product } from 'src/products/entity/products.entity';


@Table({
  tableName: 'product_tags',
  timestamps: false,
})
export class ProductTags extends Model<ProductTags> {
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

  @ForeignKey(() => Tags)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    tagId: string;
}