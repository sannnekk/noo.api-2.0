import {
  Controller,
  ControllerResponse,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import * as Asserts from '@modules/Core/Security/asserts'
import { PollService } from './Services/PollService'
import { PollValidator } from './PollValidator'

@Controller('/poll')
export class PollController {
  private readonly pollService: PollService

  private readonly pollValidator: PollValidator

  constructor() {
    this.pollService = new PollService()
    this.pollValidator = new PollValidator()
  }

  @Get('/')
  public async getPolls(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const pagination = this.pollValidator.parsePagination(context.query)

      const { entities, meta } = await this.pollService.getPolls(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/my')
  public async getMyPolls(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentorOrStudent(context)

      const pagination = this.pollValidator.parsePagination(context.query)

      const { entities, meta } = await this.pollService.getMyPolls(
        context.credentials.userId!,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/question')
  public async getQuestions(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const pagination = this.pollValidator.parsePagination(context.query)

      const { entities, meta } =
        await this.pollService.searchQuestions(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id')
  public async getPoll(context: Context): Promise<ApiResponse> {
    try {
      //await Asserts.isAuthenticated(context)
      const id = this.pollValidator.parseId(context.params.id)

      const poll = await this.pollService.getPollById(
        id,
        context.credentials?.userId
      )

      return new ApiResponse({ data: poll })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/')
  public async createPoll(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const poll = this.pollValidator.parsePoll(context.body)

      const createdPoll = await this.pollService.createPoll(poll)

      return new ApiResponse({ data: createdPoll })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id')
  public async editPoll(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.pollValidator.parseId(context.params.id)
      const poll = this.pollValidator.parsePoll(context.body)

      await this.pollService.updatePoll(id, poll)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id/info')
  public async getPollInfo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const id = this.pollValidator.parseId(context.params.id)

      const poll = await this.pollService.getPollInfo(id)

      return new ApiResponse({ data: poll })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:pollId/user')
  public async searchWhoVoted(context: Context): Promise<ControllerResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const pollId = this.pollValidator.parseId(context.params.pollId)
      const pagination = this.pollValidator.parsePagination(context.query)

      const { entities, meta } = await this.pollService.searchWhoVoted(
        context.credentials!.role,
        pollId,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:pollId/unregistered')
  public async searchWhoVotedUnregistered(
    context: Context
  ): Promise<ControllerResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const pollId = this.pollValidator.parseId(context.params.pollId)
      const pagination = this.pollValidator.parsePagination(context.query)

      const { entities, meta } =
        await this.pollService.searchWhoVotedUnregistered(
          context.credentials!.role,
          pollId,
          pagination
        )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:pollId/user/:userId/answer')
  public async getAnswers(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const pollId = this.pollValidator.parseId(context.params.pollId)
      const userIdOrTelegramUsername =
        this.pollValidator.parseIdOrTelegramUsername(context.params.userId)

      const answers = await this.pollService.getAnswers(
        context.credentials!.userId,
        context.credentials!.role,
        pollId,
        userIdOrTelegramUsername
      )

      return new ApiResponse({ data: answers })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/answer/:id')
  public async editAnswer(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)
      const answerId = this.pollValidator.parseId(context.params.id)
      const answer = this.pollValidator.parsePollAnswer(context.body)

      await this.pollService.editAnswer(answerId, answer)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/:id/answer')
  public async saveAnswers(context: Context): Promise<ApiResponse> {
    try {
      //await Asserts.isAuthenticated(context)
      const pollId = this.pollValidator.parseId(context.params.id)
      const answers = this.pollValidator.parsePollAnswers(context.body)

      await this.pollService.saveAnswers(
        context.credentials?.userId,
        context.credentials?.role,
        pollId,
        answers
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async deletePoll(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const id = this.pollValidator.parseId(context.params.id)

      await this.pollService.deletePoll(id)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
