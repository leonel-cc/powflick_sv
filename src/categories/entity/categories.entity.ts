import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript';
import { Product } from '../../products/entity/products.entity';
import { ProductCategories } from './productcategories.entity';

@Table({
  tableName: 'Categories',
  timestamps: false,
  underscored: true,
})
export class Categories extends Model<Categories> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
    id: string;

  @BelongsToMany(() => Product, () => ProductCategories)
    products: Product[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
    name: string;
}
