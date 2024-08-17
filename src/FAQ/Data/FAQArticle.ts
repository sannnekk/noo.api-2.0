import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { type BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import { FAQCategory } from './Relations/FAQCategory'

export interface FAQArticle extends BaseModel {
  order: number
  for: (User['role'] | 'all')[]
  title: string
  content: DeltaContentType
  category: FAQCategory
  categoryId: FAQCategory['id']
}
