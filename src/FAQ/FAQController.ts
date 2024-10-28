import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import * as Asserts from '@modules/Core/Security/asserts'
import { FAQService } from './Services/FAQService'
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import { FAQValidator } from './FAQValidator'

@Controller('/faq')
export class FAQController {
  private readonly faqService: FAQService

  private readonly faqValidator: FAQValidator

  public constructor() {
    this.faqService = new FAQService()
    this.faqValidator = new FAQValidator()
  }

  @Get()
  public async getArticles(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const pagination = this.faqValidator.parsePagination(context.query)

      const role = context.credentials!.role
      const { entities, meta } = await this.faqService.getArticles(
        role,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/article/:id')
  public async getArticle(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const id = this.faqValidator.parseId(context.params.id)

      const article = await this.faqService.getArticle(
        id,
        context.credentials!.role
      )

      return new ApiResponse({ data: article })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/category/tree')
  public async getCategoryTree(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const categories = await this.faqService.getCategoryTree()

      return new ApiResponse({ data: categories })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/category/tree/article')
  public async getTreeWithArticles(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const categories = await this.faqService.getTreeWithArticles()

      return new ApiResponse({ data: categories })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/category/search')
  public async searchCategories(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const pagination = this.faqValidator.parsePagination(context.query)

      const { entities, meta } =
        await this.faqService.searchCategories(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post()
  public async createArticle(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const article = this.faqValidator.parseArticle(context.body)

      const faq = await this.faqService.createArticle(article)

      return new ApiResponse({ data: faq })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/category')
  public async createCategory(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const parsedCategory = this.faqValidator.parseCategory(context.body)

      const category = await this.faqService.createCategory(parsedCategory)

      return new ApiResponse({ data: category })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id')
  public async updateFAQ(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.faqValidator.parseId(context.params.id)
      const article = this.faqValidator.parseArticle(context.body)

      await this.faqService.updateArticle(id, article)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/category/:id')
  public async updateCategory(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.faqValidator.parseId(context.params.id)
      const category = this.faqValidator.parseCategory(context.body)

      await this.faqService.updateCategory(id, category)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async deleteFAQ(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.faqValidator.parseId(context.params.id)

      await this.faqService.deleteArticle(id)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/category/:id')
  public async deleteCategory(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.faqValidator.parseId(context.params.id)

      await this.faqService.deleteCategory(id)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
