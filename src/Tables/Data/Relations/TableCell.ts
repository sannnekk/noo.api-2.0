import { BaseModel } from '@modules/Core/Data/Model'

export type TableCellType =
  | 'text'
  | 'number'
  | 'date'
  | 'percentage'
  | 'work'
  | 'user'
  | 'formula'

export interface TableCell extends BaseModel {
  type: TableCellType
  value: string
  col: number
  row: number
  background: string | null
  metadata?: any
}
