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
  public async getFAQ(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const role = context.credentials!.role
      const faq = await this.faqService.getFAQ(role)

      return new ApiResponse({ data: faq })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Post()
  public async createFAQ(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.teacherOrAdmin(context)

      const article = this.faqValidator.parseArticle(context.body)

      const faq = await this.faqService.createArticle(article)

      return new ApiResponse({ data: faq })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id')
  public async updateFAQ(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.teacherOrAdmin(context)

      const id = this.faqValidator.parseId(context.params.id)
      const article = this.faqValidator.parseArticle(context.body)

      await this.faqService.updateArticle(id, article)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Delete('/:id')
  public async deleteFAQ(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.teacherOrAdmin(context)

      const id = this.faqValidator.parseId(context.params.id)

      await this.faqService.deleteArticle(id)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
