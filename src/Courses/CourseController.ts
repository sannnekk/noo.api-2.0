import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Req,
	Res,
} from '@decorators/express'
import { Request, Response } from 'express'
import { CourseService } from './Services/CourseService'
import * as Asserts from '@modules/core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { getErrorData } from '@modules/core/Response/helpers'
import { CourseValidator } from './CourseValidator'

@Controller('/course')
export class CourseController {
	private readonly courseService: CourseService
	private readonly courseValidator: CourseValidator

	constructor() {
		this.courseService = new CourseService()
		this.courseValidator = new CourseValidator()
	}

	@Get('/')
	public async get(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			const pagination = this.courseValidator.validatePagination(
				context.query
			)

			const { courses, meta } = await this.courseService.get(
				pagination,
				context.credentials.userId,
				context.credentials.role
			)

			res.status(200).send({ data: courses, meta })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/:slug')
	public async getBySlug(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			this.courseValidator.validateSlug(context.params.slug)
			Asserts.isAuthenticated(context)

			const course = await this.courseService.getBySlug(
				context.params.slug
			)

			if (
				context.credentials.role === 'student' ||
				context.credentials.role == 'mentor'
			) {
				course.studentIds = []
				course.students = []
			}

			res.status(200).send({ data: course })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/material/:slug/assigned-work')
	public async getAssignedWork(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			this.courseValidator.validateSlug(context.params.slug)
			Asserts.isAuthenticated(context)
			Asserts.student(context)

			const assignedWork =
				await this.courseService.getAssignedWorkToMaterial(
					context.params.slug,
					context.credentials.userId
				)

			res.status(200).send({ data: assignedWork })
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
			this.courseValidator.validateCreation(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			await this.courseService.create(
				context.body,
				context.credentials.userId
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:id')
	public async update(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			this.courseValidator.validateUpdate(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			await this.courseService.update(context.body)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:materialSlug/assign-work/:workId')
	public async assignWorkToMaterial(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.courseValidator.validateSlug(context.params.materialSlug)
			this.courseValidator.validateId(context.params.workId)
			this.courseValidator.validateAssignWork(context.body)

			await this.courseService.assignWorkToMaterial(
				context.params.materialSlug,
				context.params.workId,
				context.body.solveDeadline,
				context.body.checkDeadline
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:courseSlug/assign-students')
	public async assignStudents(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.courseValidator.validateSlug(context.params.courseSlug)
			this.courseValidator.validateStudentIds(context.body)

			await this.courseService.assignStudents(
				context.params.courseSlug,
				context.body.studentIds
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
			this.courseValidator.validateId(context.params.id)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			await this.courseService.delete(context.params.id)

			res.status(200).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}
}
