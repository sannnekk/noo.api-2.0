import { Repository } from '@modules/Core/Data/Repository'
import { FAQCategory } from './FAQCategory'
import { FAQCategoryModel } from './FAQCategoryModel'
import TypeORM from 'typeorm'
import { FAQOptions } from '@modules/FAQ/FAQOptions'

export class FAQCategoryRepository extends Repository<FAQCategory> {
  public constructor() {
    super(FAQCategoryModel)
  }

  public async getRootCategories() {
    return this.findAll({
      parentCategory: TypeORM.IsNull(),
    })
  }

  public async getChildren(category: FAQCategory) {
    return this.findAll({
      parentCategory: category,
    })
  }

  public async getWholeTree() {
    return this.treeRepository().findTrees({
      depth: FAQOptions.maxCategoryDepth,
    })
  }

  public async getTreeWithArticles() {
    return this.treeRepository().findTrees({
      depth: FAQOptions.maxCategoryDepth,
      relations: ['articles'],
    })
  }
}
