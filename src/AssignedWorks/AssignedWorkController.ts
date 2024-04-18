import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Req,
	Res,
} from '@decorators/express'
import { AssignedWorkValidator } from './AssignedWorkValidator'
import { AssignedWorkService } from './Services/AssignedWorkService'
import * as Asserts from '@modules/core/Security/asserts'
import { Context } from '@modules/core/Request/context'
import { getErrorData } from '@modules/core/Response/helpers'
import { Request, Response } from 'express'
import json from 'big-json'

@Controller('/assigned-work')
export class AssignedWorkController {
	private readonly assignedWorkService: AssignedWorkService
	private readonly assignedWorkValidator: AssignedWorkValidator

	constructor() {
		this.assignedWorkService = new AssignedWorkService()
		this.assignedWorkValidator = new AssignedWorkValidator()
	}

	@Get('/')
	public async get(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			await Asserts.isAuthenticated(context)
			const pagination = this.assignedWorkValidator.validatePagination(
				context.query
			)

			const { assignedWorks, meta } =
				await this.assignedWorkService.getWorks(
					context.credentials!.userId,
					context.credentials!.role,
					pagination
				)

			res.status(200).send({ data: assignedWorks, meta })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/:id')
	public async getOne(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			this.assignedWorkValidator.validateId(context.params.id)

			const work = await this.assignedWorkService.getWorkById(
				context.params.id,
				context.credentials!.role
			)

			if (context.credentials!.role == 'student') {
				Asserts.isAuthorized(context, work.studentId)
			}

			const stream = json.createStringifyStream({
				body: { data: work },
			})

			res.setHeader('Content-Type', 'application/json')

			stream.on('data', (data: any) => {
				res.write(data)
			})

			stream.on('end', () => {
				res.end()
			})
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/')
	public async create(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			await Asserts.isAuthenticated(context)
			this.assignedWorkValidator.validateCreation(context.body)

			await this.assignedWorkService.createWork(context.body)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/:id/remake')
	public async remake(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.student(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateRemake(context.body)

			await this.assignedWorkService.remakeWork(
				context.params.id,
				context.credentials.userId,
				context.body
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/:materialSlug')
	public async getOrCreate(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.student(context)
			this.assignedWorkValidator.validateSlug(
				context.params.materialSlug
			)

			const { link } = await this.assignedWorkService.getOrCreateWork(
				context.params.materialSlug,
				context.credentials.userId
			)

			res.status(200).send({ data: link })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:id/solve')
	public async solve(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.student(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateUpdate(context.body)

			await this.assignedWorkService.solveWork(context.body)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:id/check')
	public async check(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateUpdate(context.body)

			await this.assignedWorkService.checkWork(context.body)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:id/save')
	public async save(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentorOrStudent(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateUpdate(context.body)

			await this.assignedWorkService.saveProgress(
				context.body,
				context.credentials.role
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:id/archive')
	public async archive(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.id)

			await this.assignedWorkService.archiveWork(context.params.id)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:workId/transfer/:mentorId')
	public async transfer(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.workId)
			this.assignedWorkValidator.validateId(context.params.mentorId)

			await this.assignedWorkService.transferWorkToAnotherMentor(
				context.params.workId,
				context.params.mentorId,
				context.credentials.userId
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:id/shift-deadline')
	public async shiftDeadline(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentorOrStudent(context)
			this.assignedWorkValidator.validateId(context.params.id)

			await this.assignedWorkService.shiftDeadline(
				context.params.id,
				1,
				context.credentials.role,
				context.credentials.userId
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Delete('/:id')
	public async delete(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.id)

			await this.assignedWorkService.deleteWork(
				context.params.id,
				context.credentials.id
			)

			res.status(200).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}
}
