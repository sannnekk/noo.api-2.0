import { BaseModel } from '@modules/Core/Data/Model'
import { FAQArticle } from '../FAQArticle'

export interface FAQCategory extends BaseModel {
  name: string
  order: number
  childCategories: FAQCategory[]
  parentCategory: FAQCategory
  parentCategoryId: FAQCategory['id']
  articles: FAQArticle[]
}
