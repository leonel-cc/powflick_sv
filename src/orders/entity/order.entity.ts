import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Direction } from '../../directions/entity/directions.entity';
import { User } from '../../users/entity/users.entity';
import { OrderProduct } from './orderProduct.entity';
import { Product } from '../../products/entity/products.entity';
import { Customization } from 'src/products/entity/customization.entity';
import { Review } from 'src/reviews/entity/reviews.entity';

export enum OrderStateEnum {
  APROBADO = 'APPROVED',
  PAGO = 'PAID',
  RECHAZADO = 'REJECTED',
  DESPACHO = 'DISPATCHED',
  ENCAMINO = 'ONTHEWAY',
  PENDIENTE = 'PENDING',
  ENTREGADO = 'DELIVERED',
  CANCELADO = 'CANCELLED',
}
@Table({
  tableName: 'Order',
  timestamps: true,
})
export class Order extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
    id: number;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
    total: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
    currency: {
    name: string;
    value: number;
  };

  @Column({
    type: DataType.ENUM(...Object.values(OrderStateEnum)),
    allowNull: false,
    defaultValue: OrderStateEnum.PENDIENTE,
  })
    state: OrderStateEnum;

  @Column(DataType.JSONB)
    customizations: {
    productId: string;
    customization: Customization;
  }[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
    coupon: {
    id: string;
    discount: number;
    title: string;
    content: string;
  };

  //necesario para manipular la session de stripe
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    sessionId: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
    paymentData: object;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    userId: string;

  @BelongsToMany(() => Product, () => OrderProduct)
    products: Product[];

  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => Direction)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    directionId: string;

  @BelongsTo(() => Direction)
    direction: Direction;

  @ForeignKey(() => Review)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    reviewId: string;
}
