import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { FAQArticle } from './Data/FAQArticle'
import { FAQArticleScheme } from './Schemes/FAQArticleScheme'
import { FAQCategory } from './Data/Relations/FAQCategory'
import { FAQCategoryScheme } from './Schemes/FAQCategoryScheme'

@ErrorConverter()
export class FAQValidator extends Validator {
  public parseArticle(data: unknown): FAQArticle {
    return this.parse<FAQArticle>(data, FAQArticleScheme)
  }

  public parseCategory(data: unknown): FAQCategory {
    return this.parse<FAQCategory>(data, FAQCategoryScheme)
  }
}
