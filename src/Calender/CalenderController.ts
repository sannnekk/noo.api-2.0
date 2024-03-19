import { CalenderValidator } from './CalenderValidator'
import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Res,
	Req,
} from '@decorators/express'
import { CalenderService } from './Services/CalenderService'
import { Asserts, Context, UnauthorizedError } from '@core'
import { Request, Response } from 'express'
import { getErrorData } from '@modules/Core/Response/helpers'

@Controller('/calender')
export class CalenderController {
	private readonly calenderService: CalenderService
	private readonly calenderValidator: CalenderValidator

	public constructor() {
		this.calenderService = new CalenderService()
		this.calenderValidator = new CalenderValidator()
	}

	@Post('/')
	public async createCalenderEvent(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = request.context as Context

		try {
			Asserts.isAuthenticated(context)
			this.calenderValidator.validateEventCreation(context.body)

			await this.calenderService.create(
				context.body,
				context.credentials.username
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/')
	public async getCalenderEvents(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			const pagination = this.calenderValidator.validatePagination(
				context.query
			)

			const events = await this.calenderService.get(
				context.credentials.username,
				pagination
			)

			const meta = await this.calenderService.getLastRequestMeta()

			res.status(200).send({ data: events, meta })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Delete('/:id')
	public async deleteCalenderEvent(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			this.calenderValidator.validateId(context.params.id)

			await this.calenderService.delete(
				context.params.id,
				context.credentials.username
			)

			res.status(200).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}
}
