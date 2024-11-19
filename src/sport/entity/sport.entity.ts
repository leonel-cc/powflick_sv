import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Product } from '../../products/entity/products.entity';
import { Baseball, Basketball, Gaming, Hockey, Running, Soccer } from '../enum/materials.enum';
type EnumType = typeof Soccer | typeof Basketball | typeof Hockey | typeof Baseball | typeof Gaming | typeof Running;

@Table({
  tableName: 'Sports',
  timestamps: false,
  underscored: true,
})
export class Sport extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
    id: string;

  @HasMany(() => Product)
    products: Product[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
    name: string;

  getMaterials(): string[] {
    let enumType: EnumType;
    switch (this.name) {
      case 'Soccer':
        enumType = Soccer;
        break;
      case 'Basketball':
        enumType = Basketball;
        break;
      case 'Hockey':
        enumType = Hockey;
        break;
      case 'Baseball':
        enumType = Baseball;
        break;
      case 'Gaming':
        enumType = Gaming;
        break;
      case 'Running':
        enumType = Running;
        break;
      default:
        return []; // Si el nombre de la entidad no coincide con ninguno, devolvemos un array vacío
    }
    // Devolvemos los valores del enum como un array de strings
    return Object.values(enumType);
  }
}
