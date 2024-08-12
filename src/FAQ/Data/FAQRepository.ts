import { Repository } from '@modules/Core/Data/Repository'
import { FAQArticle } from './FAQArticle'
import { FAQArticleModel } from './FAQArticleModel'

export class FAQRepository extends Repository<FAQArticle> {
  public constructor() {
    super(FAQArticleModel)
  }
}
