import { Controller, Delete, Post } from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { Context } from '@modules/Core/Request/Context'
import { ShpuntikService } from './Services/ShpuntikService'
import { ShpuntikValidator } from './ShpuntikValidator'

@Controller('/shpuntik')
export class ShpuntikController {
  private shpuntikService: ShpuntikService

  private shpuntikValidator: ShpuntikValidator

  constructor() {
    this.shpuntikService = new ShpuntikService()
    this.shpuntikValidator = new ShpuntikValidator()
  }

  @Post('/check/:workId/:taskId')
  async checkTask(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const workId = this.shpuntikValidator.parseId(context.params.workId)
      const taskId = this.shpuntikValidator.parseId(context.params.taskId)

      await this.shpuntikService.checkTask(workId, taskId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/comment/:workId/:taskId')
  async removeComment(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const workId = this.shpuntikValidator.parseId(context.params.workId)
      const taskId = this.shpuntikValidator.parseId(context.params.taskId)

      await this.shpuntikService.removeComment(workId, taskId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
