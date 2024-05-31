import { Controller, Get, Patch } from 'express-controller-decorator'
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

			const poll = this.pollService.getPollById(id)

			return new ApiResponse({ data: poll })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:id/answer')
	public async searchAnswers(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const pollId = this.pollValidator.parseId(context.params.id)
			const pagination = this.pollValidator.parsePagination(context.query)

			const { answers, meta } = await this.pollService.getAnswers(
				pollId,
				pagination
			)

			return new ApiResponse({ data: answers, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/vote')
	public async saveAnswers(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const pollId = this.pollValidator.parseId(context.params.id)
			const answers = this.pollValidator.parsePollAnswers(context.body)

			await this.pollService.saveAnswers(
				context.credentials!.userId,
				pollId,
				answers
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
