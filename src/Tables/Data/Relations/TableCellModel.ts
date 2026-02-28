import { Model } from '@modules/Core/Data/Model'
import { TableCell, TableCellType } from './TableCell'
import { Column, Entity, ManyToOne } from 'typeorm'
import { TableModel } from '../TableModel'
import { Table } from '../Table'

@Entity('table_cell')
export class TableCellModel extends Model implements TableCell {
  public constructor(data?: Partial<TableCell>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'type',
    type: 'varchar',
  })
  type!: TableCellType

  @Column({
    name: 'value',
    type: 'varchar',
  })
  value!: string

  @Column({
    name: 'col',
    type: 'int',
  })
  col!: number

  @Column({
    name: 'row',
    type: 'int',
  })
  row!: number

  @Column({
    name: 'background',
    type: 'varchar',
    nullable: true,
  })
  background!: string | null

  @Column({
    name: 'metadata',
    type: 'json',
    nullable: true,
  })
  metadata?: any

  @ManyToOne(() => TableModel, (table) => table.cells, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  table!: Table
}
