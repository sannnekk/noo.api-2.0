import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { Controller, Get, Post } from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { PushSubscriptionValidator } from './PushSubscriptionValidator'
import { PushSubscriptionService } from './Services/PushSubscriptionService'

@Controller('/push-subscription')
export class PushSubscriptionController {
  private readonly pushSubscriptionService: PushSubscriptionService

  private readonly pushSubscriptionValidator: PushSubscriptionValidator

  constructor() {
    this.pushSubscriptionValidator = new PushSubscriptionValidator()
    this.pushSubscriptionService = new PushSubscriptionService()
  }

  @Get('/public-key')
  public async getPublicKey(context: Context): Promise<ApiResponse> {
    try {
      const publicKey = this.pushSubscriptionService.getPublicKey()

      return new ApiResponse({ data: publicKey })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/unsubscribe')
  public async unsubscribe(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const unsubscription =
        this.pushSubscriptionValidator.parseUnsubscription(context.body)

      await this.pushSubscriptionService.unsubscribe(
        context.credentials!.userId,
        unsubscription
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post()
  public async subscribe(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const subscription = this.pushSubscriptionValidator.parseSubscription(
        context.body
      )

      await this.pushSubscriptionService.subscribe(
        context.credentials!.userId,
        subscription,
        context.info.userAgent || null
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
