import { Repository } from '@modules/Core/Data/Repository'
import { Table } from './Table'
import { TableModel } from './TableModel'

export class TableRepository extends Repository<Table> {
  public constructor() {
    super(TableModel)
  }
}
