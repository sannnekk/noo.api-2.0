import { Controller, Post } from 'express-controller-decorator'
import { GoogleSheetsService } from './Services/GoogleSheetsService'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { GoogleDocsValidator } from './GoogleDocsValidator'
import * as Asserts from '@modules/Core/Security/asserts'

@Controller('/telegram')
export class TelegramController {
  private readonly googleSheetsService: GoogleSheetsService

  private readonly googleDocsValidator: GoogleDocsValidator

  constructor() {
    this.googleSheetsService = new GoogleSheetsService()
    this.googleDocsValidator = new GoogleDocsValidator()
  }

  @Post('/')
  public async bindTelegram(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
