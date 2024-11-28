import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Messages } from './messages.entity';

@Table({
  tableName: 'Conversations',
  timestamps: true,
})
export class Conversation extends Model {
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
    name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    text: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
    imgUrl: string;

  @ForeignKey(() => Messages)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
    messageId: string;

  @BelongsTo(() => Messages)
    message: Messages;
}
