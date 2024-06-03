import {
	Controller,
	ControllerResponse,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { PollValidator } from './PollValidator'
import { PollService } from './Services/PollService'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import * as Asserts from '@modules/Core/Security/asserts'

@Controller('/poll')
export class PollController {
	private readonly pollService: PollService
	private readonly pollValidator: PollValidator

	constructor() {
		this.pollService = new PollService()
		this.pollValidator = new PollValidator()
	}

	@Get('/:id')
	public async getPoll(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const id = this.pollValidator.parseId(context.params.id)

			const poll = await this.pollService.getPollById(id)

			return new ApiResponse({ data: poll })
		} catch (error: any) {
			return new ApiResponse(error)
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
			return new ApiResponse(error)
		}
	}

	@Get('/:pollId/user')
	public async searchWhoVoted(context: Context): Promise<ControllerResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const pollId = this.pollValidator.parseId(context.params.pollId)
			const pagination = this.pollValidator.parsePagination(context.query)

			const { users, meta } = await this.pollService.searchWhoVoted(
				context.credentials!.role,
				pollId,
				pagination
			)

			return new ApiResponse({ data: users, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:pollId/user/:userId/answer')
	public async getAnswers(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const pollId = this.pollValidator.parseId(context.params.pollId)
			const userId = this.pollValidator.parseId(context.params.userId)

			const answers = await this.pollService.getAnswers(
				context.credentials!.role,
				pollId,
				userId
			)

			return new ApiResponse({ data: answers })
		} catch (error: any) {
			return new ApiResponse(error)
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
			return new ApiResponse(error)
		}
	}

	@Post('/:id/answer')
	public async saveAnswers(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const pollId = this.pollValidator.parseId(context.params.id)
			const answers = this.pollValidator.parsePollAnswers(context.body)

			await this.pollService.saveAnswers(
				context.credentials!.userId,
				context.credentials!.role,
				pollId,
				answers
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
