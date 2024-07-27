import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { Controller, Get } from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { PlatformService } from './Services/PlatformService'
import { PlatformValidator } from './PlatformValidator'

@Controller('/platform')
export class PlatformController {
  private readonly platformService: PlatformService

  private readonly platformValidator: PlatformValidator

  constructor() {
    this.platformService = new PlatformService()
    this.platformValidator = new PlatformValidator()
  }

  @Get('/version')
  public async version(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const result = await this.platformService.version()

      return new ApiResponse({ data: result })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/changelog')
  public async changelog(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const changelog = await this.platformService.changelog()

      return new ApiResponse({ data: changelog })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/changelog/:version')
  public async changelogOfVersion(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const version = this.platformValidator.parseVersion(
        context.params.version
      )

      const changelog = await this.platformService.changelogForVersion(version)

      return new ApiResponse({ data: changelog })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/healthcheck')
  public async healthcheck(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const result = await this.platformService.healthcheck()

      return new ApiResponse({ data: result })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
