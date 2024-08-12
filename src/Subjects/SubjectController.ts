import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { SubjectService } from './Services/SubjectService'
import { SubjectValidator } from './SubjectValidator'

@Controller('/subject')
export class SubjectController {
  private readonly subjectService: SubjectService

  private readonly subjectValidator: SubjectValidator

  public constructor() {
    this.subjectService = new SubjectService()
    this.subjectValidator = new SubjectValidator()
  }

  @Get()
  public async getSubjects(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      await Asserts.teacherOrAdmin(context)

      const pagination = this.subjectValidator.parsePagination(context.query)

      const { entities, meta } =
        await this.subjectService.getSubjects(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Post()
  public async createSubject(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      await Asserts.admin(context)

      const subject = this.subjectValidator.parseSubject(context.body)

      await this.subjectService.createSubject(subject)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id')
  public async updateSubject(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      await Asserts.admin(context)

      const id = this.subjectValidator.parseId(context.params.id)
      const subject = this.subjectValidator.parseSubject(context.body)

      await this.subjectService.updateSubject(id, subject)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Delete('/:id')
  public async deleteSubject(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      await Asserts.admin(context)

      const id = this.subjectValidator.parseId(context.params.id)

      await this.subjectService.deleteSubject(id)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
