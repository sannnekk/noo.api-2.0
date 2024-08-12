import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { type BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'

export interface FAQArticle extends BaseModel {
  for: User['role'][] | 'all'
  title: string
  content: DeltaContentType
  category: string
}
