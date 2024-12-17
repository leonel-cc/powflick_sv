import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, BelongsToMany } from 'sequelize-typescript';
import { CollectionProduct } from './collectionProduct.entity';
import { Product } from '../../products/entity/products.entity';

export enum CollectionType {
  NAVBAR = 'navbar',
  STORE = 'store',
  BOTH = 'both',
  NONE = 'none',
}

@Table({
  tableName: 'Collections',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Collection extends Model<Collection> {
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
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
  })
    order: string;

  @ApiProperty()
  @Column({
    type: DataType.ENUM,
    values: Object.values(CollectionType),
    allowNull: false,
    defaultValue: CollectionType.BOTH,
  })
    type: CollectionType;

  @BelongsToMany(() => Product, () => CollectionProduct)
    products: Product[];
}
