import { Validator } from '@modules/Core/Request/Validator'
import { Table } from './Data/Table'
import { TableScheme } from './Schemes/TableScheme'

export class TableValidator extends Validator {
  public parseTable(data: unknown): Table {
    return this.parse<Table>(data, TableScheme)
  }
}
