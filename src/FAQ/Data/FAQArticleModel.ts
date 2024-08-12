import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { User } from '@modules/Users/Data/User'
import { Column, Entity, SelectQueryBuilder } from 'typeorm'
import { FAQArticle } from './FAQArticle'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'

@Entity('faq_article')
export class FAQArticleModel extends SearchableModel implements FAQArticle {
  public constructor(data?: Partial<FAQArticle>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    type: 'simple-array',
    nullable: false,
  })
  for!: User['role'][] | 'all'

  @Column({
    name: 'title',
    type: 'varchar',
    nullable: false,
  })
  title!: string

  @Column({
    name: 'content',
    type: 'json',
    nullable: false,
  })
  content!: DeltaContentType

  @Column({
    name: 'category',
    type: 'varchar',
    nullable: false,
  })
  category!: string

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere('faq_article.title LIKE :needle', { needle: `%${needle}%` })

    return []
  }
}
