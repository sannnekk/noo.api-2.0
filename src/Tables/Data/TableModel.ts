import { TableCell } from './Relations/TableCell'
import { User } from '@modules/Users/Data/User'
import { Table } from './Table'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  SelectQueryBuilder,
} from 'typeorm'
import { UserModel } from '@modules/Users/Data/UserModel'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { TableCellModel } from './Relations/TableCellModel'

@Entity('table')
export class TableModel extends SearchableModel implements Table {
  public constructor(data?: Partial<Table>) {
    super()

    if (data) {
      this.set(data)

      if (data.cells) {
        this.cells = data.cells.map((cell) => new TableCellModel(cell))
      }
    }
  }

  @Column({
    name: 'title',
    type: 'varchar',
  })
  title!: string

  @OneToMany(() => TableCellModel, (cell) => cell.table, {
    cascade: true,
  })
  cells!: TableCell[]

  @ManyToOne(() => UserModel, (user) => user.tables)
  user?: User

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere('LOWER(table.title) LIKE LOWER(:needle)', {
      needle: `%${needle}%`,
    })

    return []
  }
}
