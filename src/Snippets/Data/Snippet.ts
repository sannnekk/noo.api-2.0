import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'

export interface Snippet extends BaseModel {
  name: string
  content: DeltaContentType
  userId: string
  user?: User
}
