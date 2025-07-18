// src/models/influencer.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  HasMany,
} from 'sequelize-typescript';
import { Product } from '../../products/entity/products.entity';

@Table({ tableName: 'Influencers', timestamps: true })
export class Influencer extends Model<Influencer> {
  @Column({
    type: DataType.STRING,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
    id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
    name: string;

  @Column({
    type: DataType.STRING,
    unique: true, // <- esto lo hace único en la base de datos
  })
    label: string;

  @Column(DataType.STRING)
    title: string;

  @Column(DataType.TEXT)
    description: string;

  @Column(DataType.STRING)
    logo: string;

  @Column(DataType.STRING)
    banner: string;

  @Column({
    type: DataType.STRING,
  })
    email: string;

  @Column(DataType.STRING)
    profileImage: string;

  @Column(DataType.JSON)
    socialMedia: {
    [key: string]: {
      label?: string;
      url?: string;
    }
  };

  @HasMany(() => Product)
    products: Product[];
}
