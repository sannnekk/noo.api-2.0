import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { FAQArticle } from './Data/FAQArticle'
import { FAQArticleScheme } from './Schemes/FAQArticleScheme'

@ErrorConverter()
export class FAQValidator extends Validator {
  public parseArticle(data: unknown): FAQArticle {
    return this.parse<FAQArticle>(data, FAQArticleScheme)
  }
}
