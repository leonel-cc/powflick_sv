import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { Conversation } from './conversationMessage';

export enum ContactType {
  ComplaintOrClaim = 'Complaint or Claim',
  OrderHelp = 'Help with an Order',
  PageFunctionalityHelp = 'Help with Page Functionality',
  GeneralHelp = 'General Help',
}

@Table({
  tableName: 'Messages',
  timestamps: true,
  createdAt: 'consultedAt',
  updatedAt: 'responseAt',
})
export class Messages extends Model {
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
    email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
    status: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
    pending: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
    message: string;

  @Column({
    type: DataType.ENUM(...Object.values(ContactType)),
    defaultValue: ContactType.GeneralHelp,
    allowNull: false,
  })
    category: ContactType;

  @HasMany(() => Conversation)
    conversation: Conversation[];
}
