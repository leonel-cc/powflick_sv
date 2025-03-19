import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript';
import { Product } from '../../products/entity/products.entity';
import { ProductTags } from './productTags.entity';

@Table({
  tableName: 'TAGS',
  timestamps: false,
  underscored: true,
})
export class Tags extends Model<Tags> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
    id: string;

  @BelongsToMany(() => Product, () => ProductTags)
    products: Product[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
    name: string;
}
