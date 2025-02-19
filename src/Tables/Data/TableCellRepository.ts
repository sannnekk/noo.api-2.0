import { Repository } from '@modules/Core/Data/Repository'
import { TableCell } from './Relations/TableCell'
import { TableCellModel } from './Relations/TableCellModel'

export class TableCellRepository extends Repository<TableCell> {
  public constructor() {
    super(TableCellModel)
  }
}
