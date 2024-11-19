import { Model, Column, DataType, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Product } from './products.entity';
import { User } from '../../users/entity/users.entity';
import { MaterialsType, NeckType, PantsType, ShortsType, SizeType, SleeveType, SocksType } from '../enum/customization.enum';
import { CartProduct } from '../../shopping-cart/entity/cart-product.entity';

@Table({
  underscored: false,
})
export class Customization extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
    id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
    userId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    productId: string;

  @Column(DataType.DOUBLE)
    price: number;

  @Column(DataType.STRING)
    size: SizeType;

  @Column(DataType.JSONB)
    frontSide: {
    logos: {
      logoUrl: string
      logoId: string
      logoPosition: {
        x: number
        y: number
      }
      logoSize: number
      rotate:number
    }[]
    texts: {
      text: string
      font: string
      textPosition: {
        x: number
        y: number
      }
      textSize: number
      textColor: string
      rotate:number
    }[]
    numbers: {
      number: string
      font: string
      numberPosition: {
        x: number
        y: number
      }
      numberSize: number
      numberColor: string
      rotate:number
    }[]
  };

  @Column(DataType.JSONB)
    backSide: {
    logos: {
      logoUrl: string
      logoId: string
      logoPosition: {
        x: number
        y: number
      }
      logoSize: number
    }[]
    texts: {
      text: string
      font: string
      textPosition: {
        x: number
        y: number
      }
      textSize: number
      textColor: string
    }[]
    numbers: {
      number: string
      numberPosition: {
        x: number
        y: number
      }
      numberSize: number
      numberColor: string
    }[]
  };

  @Column({
    type: DataType.STRING,
    defaultValue: SleeveType.Default,
  })
    sleeve: SleeveType;

  @Column({
    type: DataType.STRING,
    defaultValue: NeckType.Default,
  })
    neck: NeckType;

  @Column({
    type: DataType.STRING,
    defaultValue: SocksType['No Socks $0.00'],
  })
    socks: SocksType;

  @Column({
    type: DataType.STRING,
    defaultValue: PantsType.None,
  })
    pants: PantsType;

  @Column({
    type: DataType.STRING,
    defaultValue: ShortsType.None,
  })
    shorts: ShortsType;

  @Column({
    type: DataType.STRING,
    defaultValue: MaterialsType.None,
  })
    materials: MaterialsType;

  @Column({
    type: DataType.STRING,
  })
    designName: string;

  @BelongsTo(() => Product)
    product: Product;

  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => CartProduct)
  @Column({
    type: DataType.UUID,
    allowNull: true, // Permite valores nulos en la columna
  })
    cartProductId: string;
}