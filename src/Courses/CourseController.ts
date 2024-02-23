import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { CourseService } from './Services/CourseService'
import { Asserts, Context, ApiResponse } from '@core'
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
	public async get(context: Context): Promise<ApiResponse> {
		try {
			this.courseValidator.validatePagination(context.query)
			Asserts.isAuthenticated(context)

			const courses = await this.courseService.get(
				context.query,
				context.credentials.userId,
				context.credentials.role
			)

			const meta = await this.courseService.getLastRequestMeta()

			return new ApiResponse({ data: courses, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:slug')
	public async getBySlug(context: Context): Promise<ApiResponse> {
		try {
			this.courseValidator.validateSlug(context.params.slug)
			Asserts.isAuthenticated(context)

			const course = await this.courseService.getBySlug(
				context.params.slug
			)

			return new ApiResponse({ data: course })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/material/:slug/assigned-work')
	public async getAssignedWork(context: Context): Promise<ApiResponse> {
		try {
			this.courseValidator.validateSlug(context.params.slug)
			Asserts.isAuthenticated(context)
			Asserts.student(context)

			const assignedWork =
				await this.courseService.getAssignedWorkToMaterial(
					context.params.slug,
					context.credentials.userId
				)

			return new ApiResponse({ data: assignedWork })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post()
	public async create(context: Context): Promise<ApiResponse> {
		try {
			this.courseValidator.validateCreation(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			await this.courseService.create(
				context.body,
				context.credentials.userId
			)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id')
	public async update(context: Context): Promise<ApiResponse> {
		try {
			this.courseValidator.validateUpdate(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			await this.courseService.update(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:materialSlug/assign-work/:workId')
	public async assignWorkToMaterial(
		context: Context
	): Promise<ApiResponse> {
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

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:courseSlug/assign-students')
	public async assignStudents(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.courseValidator.validateSlug(context.params.courseSlug)
			this.courseValidator.validateStudentIds(context.body)

			await this.courseService.assignStudents(
				context.params.courseSlug,
				context.body.studentIds
			)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Delete('/:id')
	public async delete(context: Context): Promise<ApiResponse> {
		try {
			this.courseValidator.validateId(context.params.id)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			await this.courseService.delete(context.params.id)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
