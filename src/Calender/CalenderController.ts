import { CalenderValidator } from './CalenderValidator'
import {
	Controller,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { CalenderService } from './Services/CalenderService'
import { ApiResponse, Asserts, Context } from '@core'

@Controller('/calender')
export class CalenderController {
	private readonly calenderService: CalenderService
	private readonly calenderValidator: CalenderValidator

	public constructor() {
		this.calenderService = new CalenderService()
		this.calenderValidator = new CalenderValidator()
	}

	@Post()
	public async createCalenderEvent(
		context: Context
	): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.calenderValidator.validateEventCreation(context.body)

			await this.calenderService.create(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get()
	public async getCalenderEvents(
		context: Context
	): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			const pagination = this.calenderValidator.validatePagination(
				context.query
			)

			const events = await this.calenderService.get(pagination)

			const meta = await this.calenderService.getLastRequestMeta()

			return new ApiResponse({ data: events, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:id')
	public async getCalenderEvent(
		context: Context
	): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.calenderValidator.validateId(context.params.id)

			const event = await this.calenderService.getOne(context.params.id)

			return new ApiResponse({ data: event })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id')
	public async updateCalenderEvent(
		context: Context
	): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.calenderValidator.validateId(context.params.id)
			this.calenderValidator.validateEventCreation(context.body)

			await this.calenderService.update(context.params.id, context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
