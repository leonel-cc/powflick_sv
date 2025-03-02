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
import { Customization } from '../../products/entity/customization.entity';
import { Review } from '../../reviews/entity/reviews.entity';

export enum OrderStateEnum {
  APROBADO = 'APPROVED',
  PAGO = 'PAID',
  RECHAZADO = 'REJECTED',
  DESIGN_CREATION = 'DESIGN CREATION',
  DESIGN_APPROVAL = 'DESIGN APPROVAL',
  FABRIC_SAMPLE_CONFIRMATION = 'FABRIC SAMPLE CONFIRMATION',
  PRODUCTION_QUEUE = 'PRODUCTION QUEUE',
  PRINTING = 'PRINTING',
  TAILORING = 'TAILORING',
  SHIPPING_TRACKING = 'SHIPPING & TRACKING',
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
    type: DataType.STRING,
    allowNull: true,
  })
    note: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
    paymentData: object;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    trackingCode: string;

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
