import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { SnippetService } from './Service/SnippetService'
import { SnippetValidator } from './SnippetValidator'

@Controller('/snippet')
export class SnippetsController {
  private readonly snippetService: SnippetService

  private readonly snippetValidator: SnippetValidator

  public constructor() {
    this.snippetService = new SnippetService()
    this.snippetValidator = new SnippetValidator()
  }

  @Get()
  public async getSnippets(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)

      const userId = context.credentials.userId

      const snippets = await this.snippetService.getSnippets(userId)

      return new ApiResponse({ data: snippets })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post()
  public async createSnippet(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)

      const snippet = this.snippetValidator.parseSnippet(context.body)

      await this.snippetService.createSnippet(
        snippet,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id')
  public async updateSnippet(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)

      const id = this.snippetValidator.parseId(context.params.id)
      const snippet = this.snippetValidator.parseSnippet(context.body)

      await this.snippetService.updateSnippet(
        id,
        snippet,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async deleteSnippet(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)

      const id = this.snippetValidator.parseId(context.params.id)

      await this.snippetService.deleteSnippet(id, context.credentials.userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
