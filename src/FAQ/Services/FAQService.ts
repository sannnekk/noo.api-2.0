import { User } from '@modules/Users/Data/User'
import { FAQRepository } from '../Data/FAQRepository'
import { FAQArticle } from '../Data/FAQArticle'
import { Pagination } from '@modules/Core/Data/Pagination'
import { FAQCategoryRepository } from '../Data/Relations/FAQCategoryRepository'
import { FAQCategory } from '../Data/Relations/FAQCategory'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { FAQOptions } from '../FAQOptions'
import { CategoryTooDeepError } from '../Errors/CategoryTooDeepError'

export class FAQService {
  private readonly articleRepository: FAQRepository

  private readonly categoryRepository: FAQCategoryRepository

  public constructor() {
    this.articleRepository = new FAQRepository()
    this.categoryRepository = new FAQCategoryRepository()
  }

  public async getArticles(role: User['role'], pagination: Pagination) {
    return this.articleRepository.search(
      [
        {
          for: role,
        },
        {
          for: 'all',
        },
      ],
      pagination,
      ['category']
    )
  }

  public async getArticle(id: FAQArticle['id'], role: User['role']) {
    const article = await this.articleRepository.findOne({ id })

    if (!article) {
      throw new NotFoundError('Статья не найдена')
    }

    if (!article.for.includes(role) && !article.for.includes('all')) {
      throw new NotFoundError('Статья не найдена')
    }

    return article
  }

  public async searchCategories(pagination: Pagination) {
    return this.categoryRepository.search(undefined, pagination)
  }

  public async getCategoryTree() {
    return this.categoryRepository.getWholeTree()
  }

  // TODO: add role filtering
  public async getTreeWithArticles(/* role: User['role'] */) {
    return this.categoryRepository.getTreeWithArticles()
  }

  public async createArticle(article: FAQArticle) {
    return this.articleRepository.create(article)
  }

  public async createCategory(category: FAQCategory) {
    await this.ensureCategoryDepth(category)

    return this.categoryRepository.create(category)
  }

  public async updateArticle(id: string, article: FAQArticle) {
    return this.articleRepository.update({ ...article, id })
  }

  public async updateCategory(id: string, category: FAQCategory) {
    return this.categoryRepository.update({ ...category, id })
  }

  public async deleteArticle(id: string) {
    return this.articleRepository.delete(id)
  }

  public async deleteCategory(id: string) {
    return this.categoryRepository.delete(id)
  }

  private async ensureCategoryDepth(
    category: FAQCategory,
    nesting = 1
  ): Promise<void> {
    if (nesting > FAQOptions.maxCategoryDepth) {
      throw new CategoryTooDeepError()
    }

    if (!category.parentCategory) {
      return
    }

    const parentCategory = await this.categoryRepository.findOne(
      {
        id: category.parentCategory.id,
      },
      ['parentCategory']
    )

    if (parentCategory) {
      await this.ensureCategoryDepth(parentCategory, nesting + 1)
    }
  }

  /**
   * Recursive function to filter the tree of categories and articles
   * based on the user's role
   */
  private filterTree(tree: FAQCategory[], role: User['role']): FAQCategory[] {
    return tree.map((category) => {
      const childCategories = this.filterTree(
        category.childCategories || [],
        role
      )

      return {
        ...category,
        articles: (category.articles || []).filter(
          (article) => article.for.includes(role) || article.for.includes('all')
        ),
        childCategories,
      }
    })
  }
}
