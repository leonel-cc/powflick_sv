import { Column, DataType, Model, Table } from 'sequelize-typescript';

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
    message: string;

  @Column({
    type: DataType.STRING,
    defaultValue: ContactType.GeneralHelp,
    allowNull: false,
  })
    category: ContactType;

  @Column({
    type: DataType.STRING,
  })
    response: string | null;
}
