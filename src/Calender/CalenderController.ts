import { CalenderEvent } from './Data/CalenderEvent'
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
import * as Asserts from '@modules/core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { getErrorData } from '@modules/core/Response/helpers'
import { Request, Response } from 'express'

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
		const context = req.context as Context

		try {
			await Asserts.isAuthenticated(context)
			this.calenderValidator.validateEventCreation(context.body)

			const calenderEvent = await this.calenderService.create(
				context.body,
				context.credentials!.username
			)

			res.status(201).send({ data: calenderEvent })
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
			await Asserts.isAuthenticated(context)
			const pagination = this.calenderValidator.validatePagination(
				context.query
			)

			const { events, meta } = await this.calenderService.get(
				context.credentials!.username,
				pagination
			)

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
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			this.calenderValidator.validateId(context.params.id)

			await this.calenderService.delete(
				context.params.id,
				context.credentials!.username
			)

			res.status(200).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}
}
