import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { GoogleSheetsValidator } from './GoogleSheetsValidator'
import * as Asserts from '@modules/Core/Security/asserts'
import { GoogleSheetsIntegrationService } from './Services/GoogleSheetsIntegrationService'

@Controller('/google-docs')
export class GoogleSheetsController {
  private readonly googleDocsIntegrationService: GoogleSheetsIntegrationService

  private readonly googleDocsValidator: GoogleSheetsValidator

  constructor() {
    this.googleDocsIntegrationService = new GoogleSheetsIntegrationService()
    this.googleDocsValidator = new GoogleSheetsValidator()
  }

  @Get('/binding')
  public async getBindings(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const pagination = this.googleDocsValidator.parsePagination(context.query)

      const { entities, meta } =
        await this.googleDocsIntegrationService.getBindings(pagination)

      return new ApiResponse({ data: entities, meta })
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

  @Patch('/binding/:id/trigger')
  public async triggerBinding(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.googleDocsValidator.parseId(context.params.id)

      await this.googleDocsIntegrationService.triggerBinding(id)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/binding/:id/switch-on-off')
  public async switchOnOffBinding(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.googleDocsValidator.parseId(context.params.id)

      await this.googleDocsIntegrationService.switchOnOffBinding(id)

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
