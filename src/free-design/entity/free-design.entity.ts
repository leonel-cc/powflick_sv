import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

@Table
export class FreeDesign extends Model<FreeDesign> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
    id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    teamName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    sport: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    color: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
    description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    date: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
    primaryColors: string[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
    secondaryColors: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
    addNames: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
    addNumbers: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
    logos: string[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
    otherImages: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    fullName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    organization: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    phone: string;
}
