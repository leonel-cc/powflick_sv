import {
  BeforeDestroy,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CartProduct } from './cart-product.entity';
import { Product } from '../../products/entity/products.entity';
import { User } from '../../users/entity/users.entity';

@Table({
  tableName: 'ShoppingCart',
  timestamps: true,
  underscored: true,
})
export class ShoppingCart extends Model {
  @BeforeDestroy
  static async destroyCartProduct(instance: ShoppingCart) {
    console.log('te');
    await CartProduct.destroy({
      where: { cartId: instance.id },
      force: true,
    });
    console.log('hi');
    
  }

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true,
  })
    id: string;

  @BelongsToMany(() => Product, () => CartProduct)
    products: Product[];

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
    userId: string;
}