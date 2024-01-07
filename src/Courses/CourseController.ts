import {
	Controller,
	ControllerResponse,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { CourseService } from './Services/CourseService'
import { Asserts, Context } from '@core'
import { CourseValidator } from './CourseValidator'
import { StatusCodes } from 'http-status-codes'

@Controller('/course')
export class CourseController {
	private readonly courseService: CourseService
	private readonly courseValidator: CourseValidator

	constructor() {
		this.courseService = new CourseService()
		this.courseValidator = new CourseValidator()
	}

	@Get()
	public async get(context: Context): Promise<ControllerResponse> {
		try {
			this.courseValidator.validatePagination(context.body)
			Asserts.isAuthenticated(context)
			const courses = await this.courseService.get(context.body)
			return new ControllerResponse(courses, StatusCodes.OK)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Get('/:slug')
	public async getBySlug(
		context: Context
	): Promise<ControllerResponse> {
		try {
			this.courseValidator.validateSlug(context.params.slug)
			Asserts.isAuthenticated(context)
			const course = await this.courseService.getBySlug(
				context.params.slug
			)
			return new ControllerResponse(course, StatusCodes.OK)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Post()
	public async create(context: Context): Promise<ControllerResponse> {
		try {
			this.courseValidator.validateCreation(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			const course = await this.courseService.create(
				context.body,
				context.credentials.userId
			)
			return new ControllerResponse(course, StatusCodes.CREATED)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Patch('/:id')
	public async update(context: Context): Promise<ControllerResponse> {
		try {
			this.courseValidator.validateUpdate(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			const course = await this.courseService.update(context.body)
			return new ControllerResponse(course, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				error,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Delete('/:id')
	public async delete(context: Context): Promise<ControllerResponse> {
		try {
			this.courseValidator.validateId(context.params.id)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			await this.courseService.delete(context.params.id)
			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}
}
