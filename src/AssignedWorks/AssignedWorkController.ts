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
import { Asserts, Context } from '@core'
import { Request, Response } from 'express'
import { getErrorData } from '@modules/Core/Response/helpers'

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
			Asserts.isAuthenticated(context)
			const pagination = this.assignedWorkValidator.validatePagination(
				context.query
			)

			const works = await this.assignedWorkService.getWorks(
				context.credentials.userId,
				context.credentials.role,
				pagination
			)

			const meta = await this.assignedWorkService.getLastRequestMeta()

			res.status(200).send({ data: works, meta })
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
			Asserts.isAuthenticated(context)
			this.assignedWorkValidator.validateId(context.params.id)

			const work = await this.assignedWorkService.getWorkById(
				context.params.id
			)

			if (context.credentials.role == 'student') {
				Asserts.isAuthorized(context, work.studentId)

				if (work && work.checkStatus === 'in-progress') {
					work.comments = []
				}
			} else {
				Asserts.isAuthorized(context, work.mentorIds)
			}

			res.status(200).send({ data: work })
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
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.assignedWorkValidator.validateCreation(context.body)

			await this.assignedWorkService.createWork(context.body)

			res.status(201).send({ data: null })
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
			Asserts.isAuthenticated(context)
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
			Asserts.isAuthenticated(context)
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
			Asserts.isAuthenticated(context)
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
			Asserts.isAuthenticated(context)
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
			Asserts.isAuthenticated(context)
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
			Asserts.isAuthenticated(context)
			Asserts.mentorOrStudent(context)
			this.assignedWorkValidator.validateId(context.params.id)

			await this.assignedWorkService.shiftDeadline(
				context.params.id,
				3,
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
			Asserts.isAuthenticated(context)
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
