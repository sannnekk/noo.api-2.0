import { Controller, Post } from 'express-controller-decorator'
import { TelegramService } from './Service/TelegramService'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { TelegramValidator } from './TelegramValidator'

@Controller('/telegram')
export class TelegramController {
  private readonly telegramService: TelegramService

  private readonly telegramValidator: TelegramValidator

  constructor() {
    this.telegramService = new TelegramService()
    this.telegramValidator = new TelegramValidator()
  }

  @Post('/')
  public async bindTelegram(context: Context): Promise<ApiResponse> {
    try {
      await context.isAuthenticated()

      const bindingData = this.telegramValidator.parseBindingData(context.body)

      await this.telegramService.bindTelegram(
        context.credentials!.userId,
        bindingData
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
