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
import { FavouriteTaskService } from './Services/FavouriteTaskService'

@Controller('/assigned-work')
export class AssignedWorkController {
  private readonly favouriteTaskService: FavouriteTaskService

  private readonly assignedWorkService: AssignedWorkService

  private readonly assignedWorkValidator: AssignedWorkValidator

  constructor() {
    this.assignedWorkService = new AssignedWorkService()
    this.favouriteTaskService = new FavouriteTaskService()
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/recheck-automatically')
  public async recheсkAutomatically(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const workId = this.assignedWorkValidator.parseId(context.params.id)

      await this.assignedWorkService.recheckAutomatically(workId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/save')
  public async save(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const workId = this.assignedWorkValidator.parseId(context.params.id)
      const saveOptions = this.assignedWorkValidator.parseSave(context.body)

      await this.assignedWorkService.saveProgress(
        workId,
        saveOptions,
        context.credentials!.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/save-work-comments')
  public async saveWorkComments(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudent(context)

      const workId = this.assignedWorkValidator.parseId(context.params.id)
      const comments = this.assignedWorkValidator.parseWorkComments(
        context.body
      )

      await this.assignedWorkService.saveWorkComments(
        workId,
        comments,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/save-answer')
  public async saveAnswer(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudentOrAssistant(context)

      const assignedWorkId = this.assignedWorkValidator.parseId(
        context.params.id
      )
      const answer = this.assignedWorkValidator.parseAnswer(context.body)

      const answerId = await this.assignedWorkService.saveAnswer(
        assignedWorkId,
        answer,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse({ data: answerId })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/save-comment')
  public async saveComment(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      //Asserts.notStudent(context)

      const assignedWorkId = this.assignedWorkValidator.parseId(
        context.params.id
      )
      const comment = this.assignedWorkValidator.parseComment(context.body)

      const commentId = await this.assignedWorkService.saveComment(
        assignedWorkId,
        comment,
        context.credentials!.userId
      )

      return new ApiResponse({ data: commentId })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/task/favourites/:subjectId/:count?')
  public async getFavourites(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)

      const subjectId = this.assignedWorkValidator.parseId(
        context.params.subjectId
      )
      const count = this.assignedWorkValidator.parseInt(context.params.count)

      const { entities, meta } =
        await this.favouriteTaskService.getFavouriteTasks(
          context.credentials.userId,
          subjectId,
          count
        )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/task/:taskId/is-favourite')
  public async isFavourite(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)

      const taskId = this.assignedWorkValidator.parseId(context.params.taskId)

      const isFavourite = await this.favouriteTaskService.isTaskFavourite(
        context.credentials.userId,
        taskId
      )

      return new ApiResponse({ data: isFavourite })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/task/:taskId/add-to-favourites')
  public async addToFavourites(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)

      const taskId = this.assignedWorkValidator.parseId(context.params.taskId)

      await this.favouriteTaskService.addTaskToFavourites(
        context.credentials.userId,
        taskId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/task/:taskId/remove-from-favourites')
  public async removeFromFavourites(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)

      const taskId = this.assignedWorkValidator.parseId(context.params.taskId)

      await this.favouriteTaskService.removeFavouriteTask(
        context.credentials.userId,
        taskId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/task/bulk/favourites/remove')
  public async bulkRemoveFromFavourites(
    context: Context
  ): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)

      const payload = this.assignedWorkValidator.parseBulkFavouriteTasksRemove(
        context.body
      )

      await this.favouriteTaskService.bulkRemoveFavouriteTasks(
        context.credentials.userId,
        payload.ids
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/archive')
  public async archive(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudentOrAssistant(context)

      const workId = this.assignedWorkValidator.parseId(context.params.id)

      await this.assignedWorkService.archiveWork(
        workId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/unarchive')
  public async unarchive(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudentOrAssistant(context)
      const workId = this.assignedWorkValidator.parseId(context.params.id)

      await this.assignedWorkService.unarchiveWork(
        workId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:workId/replace-mentor/:mentorId')
  public async replaceMentor(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdminOrAssistant(context)

      const workId = this.assignedWorkValidator.parseId(context.params.workId)
      const mentorId = this.assignedWorkValidator.parseId(
        context.params.mentorId
      )

      await this.assignedWorkService.replaceMentor(workId, mentorId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/send-to-recheck')
  public async sendToRecheck(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const assignedWorkId = this.assignedWorkValidator.parseId(
        context.params.id
      )

      await this.assignedWorkService.sendToRecheck(
        assignedWorkId,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
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
      return new ApiResponse(error, context)
    }
  }
}
