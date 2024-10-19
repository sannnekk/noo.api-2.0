import { Controller, Get, Patch } from 'express-controller-decorator'
import { UserSettingsService } from './Services/UserSettingsService'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import * as Asserts from '@modules/Core/Security/asserts'
import { UserSettingsValidator } from './UserSettingsValidator'

@Controller('/user-settings')
export class UserController {
  private readonly userSettingsService: UserSettingsService

  private readonly settingsValidator: UserSettingsValidator

  constructor() {
    this.userSettingsService = new UserSettingsService()
    this.settingsValidator = new UserSettingsValidator()
  }

  @Get()
  public async get(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const userSettings = await this.userSettingsService.getSettings(
        context.credentials!.userId
      )

      return new ApiResponse({ data: userSettings })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch()
  public async update(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const settings = this.settingsValidator.parseSettings(context.body)

      const userSettings = await this.userSettingsService.updateSettings(
        context.credentials!.userId,
        settings
      )

      return new ApiResponse({ data: userSettings })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
