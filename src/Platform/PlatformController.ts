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
      return new ApiResponse(error, context)
    }
  }

  @Get('/changelog')
  public async changelog(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const changelog = await this.platformService.changelog()

      return new ApiResponse({ data: changelog })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/changelog/:version')
  public async changelogOfVersion(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const version = this.platformValidator.parseVersion(
        context.params.version
      )

      const changelog = await this.platformService.changelogForVersion(version)

      return new ApiResponse({ data: changelog })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  // keep without authentication for now, as it is used by kubelet to check if the server is up and running
  @Get('/healthcheck')
  public async healthcheck(context: Context): Promise<ApiResponse> {
    try {
      const result = await this.platformService.healthcheck()

      return new ApiResponse({ data: result })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/heapdump')
  public async heapdump(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const heapdumpFilePath = await this.platformService.heapdump()

      return new ApiResponse({
        data: {
          path: heapdumpFilePath,
        },
      })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
