import { CalenderValidator } from './CalenderValidator'
import { Controller, Delete, Get, Post } from 'express-controller-decorator'
import { CalenderService } from './Services/CalenderService'
import * as Asserts from '@modules/core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'

@Controller('/calender')
export class CalenderController {
	private readonly calenderService: CalenderService
	private readonly calenderValidator: CalenderValidator

	public constructor() {
		this.calenderService = new CalenderService()
		this.calenderValidator = new CalenderValidator()
	}

	@Post('/')
	public async createCalenderEvent(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const eventCreationOptions = this.calenderValidator.parseEventCreation(
				context.body
			)

			const calenderEvent = await this.calenderService.create(
				eventCreationOptions,
				context.credentials!.username
			)

			return new ApiResponse({ data: calenderEvent })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/')
	public async getCalenderEvents(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const pagination = this.calenderValidator.parsePagination(context.query)

			const { events, meta } = await this.calenderService.get(
				context.credentials!.username,
				pagination
			)

			return new ApiResponse({ data: events, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Delete('/:id')
	public async deleteCalenderEvent(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const eventId = this.calenderValidator.parseId(context.params.id)

			await this.calenderService.delete(eventId, context.credentials!.username)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
