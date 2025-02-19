import { BaseModel } from '@modules/Core/Data/Model'
import { TableCell } from './Relations/TableCell'
import { User } from '@modules/Users/Data/User'

export interface Table extends BaseModel {
  title: string
  cells: TableCell[]
  user?: User
}
