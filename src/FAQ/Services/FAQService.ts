import { User } from '@modules/Users/Data/User'
import { FAQRepository } from '../Data/FAQRepository'
import { FAQArticle } from '../Data/FAQArticle'

export class FAQService {
  private readonly repository: FAQRepository

  public constructor() {
    this.repository = new FAQRepository()
  }

  public async getFAQ(role: User['role']) {
    return this.repository
      .queryBuilder()
      .where('for LIKE :role', { for: role })
      .orWhere('for LIKE :all', { for: 'all' })
      .orderBy('title', 'ASC')
      .getMany()
  }

  public async createArticle(article: FAQArticle) {
    return this.repository.create(article)
  }

  public async updateArticle(id: string, article: FAQArticle) {
    return this.repository.update({ ...article, id })
  }

  public async deleteArticle(id: string) {
    return this.repository.delete(id)
  }
}
