import { Controller, Delete, Get } from 'express-controller-decorator'
import { SessionService } from './Services/SessionService'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { Context } from '@modules/Core/Request/Context'
import * as Asserts from '@modules/Core/Security/asserts'
import { SessionValidator } from './SessionValidator'

@Controller('/session')
export class SessionController {
  private readonly sessionService: SessionService

  private readonly sessionValidator: SessionValidator

  public constructor() {
    this.sessionService = new SessionService()
    this.sessionValidator = new SessionValidator()
  }

  @Get()
  public async getSessionsForUser(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const sessions = await this.sessionService.getSessionsForUser(context)

      return new ApiResponse({ data: sessions })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Delete()
  public async deleteCurrentSession(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      await this.sessionService.deleteCurrentSession(context)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Delete('/:id')
  public async deleteSession(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const sessionId = this.sessionValidator.parseId(context.params.id)

      await this.sessionService.deleteSession(
        sessionId,
        context.credentials!.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
