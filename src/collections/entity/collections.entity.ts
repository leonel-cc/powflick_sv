import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

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

}
