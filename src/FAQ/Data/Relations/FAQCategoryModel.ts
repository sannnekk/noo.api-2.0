import { BaseModel } from '@modules/Core/Data/Model'
import { FAQCategory } from './FAQCategory'
import { FAQArticle } from '../FAQArticle'
import {
  Column,
  Entity,
  OneToMany,
  RelationId,
  SelectQueryBuilder,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm'
import { FAQArticleModel } from '../FAQArticleModel'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'

@Entity('faq_category', {
  orderBy: {
    order: 'ASC',
  },
})
@Tree('closure-table', {
  ancestorColumnName: () => 'ancestorId',
  descendantColumnName: () => 'descendantId',
})
export class FAQCategoryModel extends SearchableModel implements FAQCategory {
  constructor(data?: Partial<FAQCategory>) {
    super()

    if (data) {
      this.set(data)

      if (data.parentCategoryId) {
        this.parentCategory = new FAQCategoryModel({
          id: data.parentCategoryId,
        })
      }

      if (data.childCategories) {
        this.childCategories = data.childCategories.map(
          (category) => new FAQCategoryModel(category)
        )
      }

      if (data.articles) {
        this.articles = data.articles.map(
          (article) => new FAQArticleModel(article)
        )
      }
    }
  }

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
    length: 255,
  })
  name!: string

  @Column({
    name: 'order',
    type: 'int',
    nullable: false,
    default: 0,
  })
  order!: number

  @TreeChildren()
  childCategories!: FAQCategory[]

  @TreeParent()
  parentCategory!: FAQCategory

  @RelationId((category: FAQCategoryModel) => category.parentCategory)
  parentCategoryId!: string

  @OneToMany(() => FAQArticleModel, (article) => article.category)
  articles!: FAQArticle[]

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere('LOWER(faq_category.name) LIKE LOWER(:needle)', {
      needle: `%${needle}%`,
    })

    return []
  }
}
