import { Controller, Delete, Get, Post } from 'express-controller-decorator'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { GoogleDocsValidator } from './GoogleDocsValidator'
import * as Asserts from '@modules/Core/Security/asserts'
import { GoogleDocsIntegrationService } from './Services/GoogleDocsIntegrationService'

@Controller('/google-docs')
export class GoogleDocsController {
  private readonly googleDocsIntegrationService: GoogleDocsIntegrationService

  private readonly googleDocsValidator: GoogleDocsValidator

  constructor() {
    this.googleDocsIntegrationService = new GoogleDocsIntegrationService()
    this.googleDocsValidator = new GoogleDocsValidator()
  }

  @Get('/binding')
  public async getBindings(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const pagination = this.googleDocsValidator.parsePagination(context.query)

      const { bindings, meta } =
        await this.googleDocsIntegrationService.getBindings(pagination)

      return new ApiResponse({ data: bindings, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Post('/binding')
  public async createBinding(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const data = this.googleDocsValidator.parseGoogleDocsBinding(context.body)

      await this.googleDocsIntegrationService.createBinding(data)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Delete('/binding/:id')
  public async deleteBinding(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.googleDocsValidator.parseId(context.params.id)

      await this.googleDocsIntegrationService.deleteBinding(id)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
