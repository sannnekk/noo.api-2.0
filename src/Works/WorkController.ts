import * as Asserts from '@modules/Core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { WorkValidator } from './WorkValidator'
import { WorkService } from './Services/WorkService'

@Controller('/work')
export class WorkController {
  private readonly workService: WorkService

  private readonly workValidator: WorkValidator

  public constructor() {
    this.workService = new WorkService()
    this.workValidator = new WorkValidator()
  }

  @Get('/')
  public async getWorks(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const pagination = this.workValidator.parsePagination(context.query)

      const { entities, meta } = await this.workService.getWorks(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:slug')
  public async getWorkBySlug(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const workSlug = this.workValidator.parseSlug(context.params.slug)

      const work = await this.workService.getWorkBySlug(workSlug)

      return new ApiResponse({ data: work })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id/statistics')
  public async getWorkStatistics(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const workSlug = this.workValidator.parseId(context.params.id)

      const workStatistics = await this.workService.getWorkStatistics(workSlug)

      return new ApiResponse({ data: workStatistics })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id/related-materials')
  public async getWorkRelatedMaterials(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const id = this.workValidator.parseId(context.params.id)
      const pagination = this.workValidator.parsePagination(context.query)

      const { entities, meta } = await this.workService.getWorkRelatedMaterials(
        id,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/')
  public async createWork(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const workDTO = this.workValidator.parseCreation(context.body)

      const work = await this.workService.createWork(workDTO)

      return new ApiResponse({ data: work })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/copy/:slug')
  public async copyWork(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const workSlug = this.workValidator.parseSlug(context.params.slug)

      await this.workService.copyWork(workSlug)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id')
  public async updateWork(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const workDTO = this.workValidator.parseUpdate(context.body)
      const id = this.workValidator.parseId(context.params.id)

      await this.workService.updateWork(id, workDTO)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async deleteWork(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const id = this.workValidator.parseId(context.params.id)

      await this.workService.deleteWork(id)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
