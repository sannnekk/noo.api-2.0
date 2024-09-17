import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { AssignedWorkService } from './Services/AssignedWorkService'
import { AssignedWorkValidator } from './AssignedWorkValidator'

@Controller('/assigned-work')
export class AssignedWorkController {
  private readonly assignedWorkService: AssignedWorkService

  private readonly assignedWorkValidator: AssignedWorkValidator

  constructor() {
    this.assignedWorkService = new AssignedWorkService()
    this.assignedWorkValidator = new AssignedWorkValidator()
  }

  @Get('/')
  public async get(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const pagination = this.assignedWorkValidator.parsePagination(
        context.query
      )

      const { entities, meta } = await this.assignedWorkService.getWorks(
        context.credentials!.userId,
        context.credentials!.role,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/from-user/:userId')
  public async getFromUser(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)
      const userId = this.assignedWorkValidator.parseId(context.params.userId)
      const pagination = this.assignedWorkValidator.parsePagination(
        context.query
      )

      const { entities, meta } = await this.assignedWorkService.getWorks(
        userId,
        undefined,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/:id')
  public async getOne(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)

      const work = await this.assignedWorkService.getWorkById(
        workId,
        context.credentials!.role
      )

      if (context.credentials!.role === 'student') {
        Asserts.isAuthorized(context, work.studentId)
      }

      if (context.credentials!.role === 'mentor' && work.work.type !== 'test') {
        Asserts.isAuthorized(context, work.mentorIds)
      }

      return new ApiResponse({ data: work })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/progress/:workId')
  public async getProgressByWorkId(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)

      const workId = this.assignedWorkValidator.parseId(context.params.workId)

      const progress = await this.assignedWorkService.getProgressByWorkId(
        workId,
        context.credentials.userId
      )

      return new ApiResponse({ data: progress })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Post('/')
  public async create(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const options = this.assignedWorkValidator.parseCreation(context.body)

      await this.assignedWorkService.createWork(options)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Post('/:id/remake')
  public async remake(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)
      const options = this.assignedWorkValidator.parseRemake(context.body)

      await this.assignedWorkService.remakeWork(
        workId,
        context.credentials.userId,
        options
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Post('/:materialSlug')
  public async getOrCreate(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)
      const materialSlug = this.assignedWorkValidator.parseSlug(
        context.params.materialSlug
      )

      const { link } = await this.assignedWorkService.getOrCreateWork(
        materialSlug,
        context.credentials.userId
      )

      return new ApiResponse({ data: { link } })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/solve')
  public async solve(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)
      const options = this.assignedWorkValidator.parseSolve(context.body)

      await this.assignedWorkService.solveWork(
        workId,
        options,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/check')
  public async check(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)
      const checkOptions = this.assignedWorkValidator.parseCheck(context.body)

      await this.assignedWorkService.checkWork(
        workId,
        checkOptions,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/recheck-automatically')
  public async rechekAutomatically(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const workId = this.assignedWorkValidator.parseId(context.params.id)

      await this.assignedWorkService.recheckAutomatically(workId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/save')
  public async save(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudent(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)
      const saveOptions = this.assignedWorkValidator.parseSave(context.body)

      await this.assignedWorkService.saveProgress(
        workId,
        saveOptions,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/archive')
  public async archive(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudent(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)

      await this.assignedWorkService.archiveWork(
        workId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/unarchive')
  public async unarchive(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudent(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)

      await this.assignedWorkService.unarchiveWork(
        workId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:workId/transfer/:mentorId')
  public async transfer(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)
      const workId = this.assignedWorkValidator.parseId(context.params.workId)
      const mentorId = this.assignedWorkValidator.parseId(
        context.params.mentorId
      )

      await this.assignedWorkService.transferWorkToAnotherMentor(
        workId,
        mentorId,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:workId/replace-mentor/:mentorId')
  public async replaceMentor(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)
      const workId = this.assignedWorkValidator.parseId(context.params.workId)
      const mentorId = this.assignedWorkValidator.parseId(
        context.params.mentorId
      )

      await this.assignedWorkService.replaceMentor(workId, mentorId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/shift-deadline')
  public async shiftDeadline(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudent(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)

      const newDeadlines = await this.assignedWorkService.shiftDeadline(
        workId,
        context.credentials.role,
        context.credentials.userId
      )

      return new ApiResponse({ data: newDeadlines })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/send-to-revision')
  public async sendToRevision(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)

      await this.assignedWorkService.sendToRevision(
        workId,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Delete('/:id')
  public async delete(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudent(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)

      await this.assignedWorkService.deleteWork(
        workId,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
