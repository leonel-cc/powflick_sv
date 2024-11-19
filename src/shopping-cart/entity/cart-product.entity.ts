import {
  BeforeDestroy,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { ShoppingCart } from './shopping-cart.entity';
import { Product } from '../../products/entity/products.entity';
import { Customization } from '../../products/entity/customization.entity';

@Table({
  tableName: 'CartProduct',
  timestamps: true,
  underscored: true,
})
export class CartProduct extends Model<CartProduct> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true,
  })
    id: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
    amount: number;

  @ForeignKey(() => ShoppingCart)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    cartId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    productId: string;

  @HasMany(() => Customization, { onDelete: 'SET NULL' }) // esto permite eliminar cartProduct sin tener que eliminar las customizaciones
    customizations: Customization[];
}
