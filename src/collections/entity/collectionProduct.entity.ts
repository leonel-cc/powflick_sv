import { Column, DataType, Model, Table, ForeignKey } from 'sequelize-typescript';
import { Collection } from './collections.entity';
import { Product } from '../../products/entity/products.entity';

@Table({
  tableName: 'CollectionProduct',
  underscored: true,
  timestamps: false,
})
export class CollectionProduct extends Model<CollectionProduct> {
  @ForeignKey(() => Collection)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    collectionId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    productId: string;
}
