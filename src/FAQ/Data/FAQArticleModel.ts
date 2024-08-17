import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { User } from '@modules/Users/Data/User'
import {
  Column,
  Entity,
  ManyToOne,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm'
import { FAQArticle } from './FAQArticle'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { config } from '@modules/config'
import { FAQCategoryModel } from './Relations/FAQCategoryModel'

@Entity('faq_article', {
  orderBy: {
    order: 'ASC',
  },
})
export class FAQArticleModel extends SearchableModel implements FAQArticle {
  public constructor(data?: Partial<FAQArticle>) {
    super()

    if (data) {
      this.set(data)

      if (data.categoryId) {
        this.category = new FAQCategoryModel({ id: data.categoryId })
      }
    }
  }

  @Column({
    type: 'simple-array',
    nullable: false,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  for!: (User['role'] | 'all')[]

  @Column({
    name: 'title',
    type: 'varchar',
    nullable: false,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  title!: string

  @Column({
    name: 'order',
    type: 'int',
    nullable: false,
    default: 0,
  })
  order!: number

  @Column({
    name: 'content',
    type: 'json',
    nullable: false,
  })
  content!: DeltaContentType

  @ManyToOne(() => FAQCategoryModel, (category) => category.articles)
  category!: FAQCategoryModel

  @RelationId((article: FAQArticleModel) => article.category)
  categoryId!: FAQCategoryModel['id']

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere('LOWER(faq_article.title) LIKE LOWER(:needle)', {
      needle: `%${needle}%`,
    })

    return []
  }
}
