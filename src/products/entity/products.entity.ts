import { AfterCreate, AfterUpdate, AllowNull, BeforeCreate, BeforeUpdate, BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Categories } from '../../categories/entity/categories.entity';
import { ProductCategories } from '../../categories/entity/productcategories.entity';
import { Sport } from '../../sport/entity/sport.entity';
import { calculateDiscount } from '../../utils/tools';
import { Customization } from './customization.entity';
import { ShoppingCart } from '../../shopping-cart/entity/shopping-cart.entity';
import { CartProduct } from '../../shopping-cart/entity/cart-product.entity';
import { UserProductFav } from '../../users/entity/userproductfav.entity';
import { User } from '../../users/entity/users.entity';
import { Order } from '../../orders/entity/order.entity';
import { OrderProduct } from '../../orders/entity/orderProduct.entity';
import { Collection } from 'src/collections/entity/collections.entity';
import { CollectionProduct } from 'src/collections/entity/collectionProduct.entity';

export enum StateProduct {
  Active = 'publish',
  Inactive = 'draft',
}

@Table({
  tableName: 'Products',
})
export class Product extends Model {
  @BeforeCreate
  @BeforeUpdate
  static async setPriceAndUrl(instance: Product) {
    instance.price = calculateDiscount(instance.regular_price, instance.discount);
    if (instance.images && instance.images.length > 0) {
      instance.URL = instance.images[0];
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async setStatus(instance: Product) {
    if (!instance.images) {
      instance.status = StateProduct.Inactive;
    }
  }

  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
    id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
    title: string;

  @Column({
    type: DataType.STRING,
  })
    content: string;

  @Column({
    type: DataType.STRING,
  })
    short_description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    date: string;

  @Column({
    type: DataType.DOUBLE,
  })
    price: number;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
    regular_price: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: true,
  })
    discount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    stock_status: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
    stock: number;

  @Column({
    type: DataType.INTEGER,
  })
    selled: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    product_categories: string;

  @Column({
    type: DataType.STRING,
  })
    genders: string;

  @Column({
    type: DataType.STRING,
  })
    sports: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
    colors: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    status: StateProduct;

  @Column({
    type: DataType.STRING,
  })
    URL: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
    images: string[];

  @Column({
    type: DataType.STRING,
  })
    slug: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
    featured: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    font: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    font_color: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
    mostSold: boolean;

  @ForeignKey(() => Sport)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    sportId: string;

  @BelongsToMany(() => ShoppingCart, () => CartProduct)
    products: ShoppingCart[];

  @BelongsTo(() => Sport)
    sport: Sport;

  @BelongsToMany(() => Categories, () => ProductCategories)
    categories: Categories[];

  @BelongsToMany(() => User, () => UserProductFav)
    favoritedBy: User[];

  @BelongsToMany(() => Order, () => OrderProduct)
    order: Order[];

  @HasMany(() => Customization)
    customizations: Customization;

  @BelongsToMany(() => Collection, () => CollectionProduct)
    collections: Collection[];
}