import { WorkService } from './Services/WorkService'
import { WorkValidator } from './WorkValidator'
import * as Asserts from '@modules/Core/Security/asserts'
import { getErrorData } from '@modules/Core/Response/helpers'
import { Context } from '@modules/Core/Request/Context'
import { Request, Response } from 'express'
import {
	Req,
	Res,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
} from '@decorators/express'

@Controller('/work')
export class WorkController {
	private readonly workService: WorkService
	private readonly workValidator: WorkValidator

	public constructor() {
		this.workService = new WorkService()
		this.workValidator = new WorkValidator()
	}

	@Get('/')
	public async getWorks(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			const pagination = this.workValidator.validatePagination(
				context.query
			)

			const { works, meta } = await this.workService.getWorks(
				pagination
			)

			res.status(200).send({ data: works, meta })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/:slug')
	public async getWorkBySlug(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)

			this.workValidator.validateSlug(context.params.slug)

			const work = await this.workService.getWorkBySlug(
				context.params.slug
			)

			res.status(200).send({ data: work })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/')
	public async createWork(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			this.workValidator.validateCreation(context.body)

			await this.workService.createWork(context.body)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/copy/:slug')
	public async copyWork(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			this.workValidator.validateSlug(context.params.slug)

			await this.workService.copyWork(context.params.slug)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:id')
	public async updateWork(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			this.workValidator.validateUpdate(context.body)
			this.workValidator.validateId(context.params.id)

			await this.workService.updateWork(context.body)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Delete('/:id')
	public async deleteWork(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			this.workValidator.validateId(context.params.id)

			await this.workService.deleteWork(context.params.id)

			res.status(200).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}
}
