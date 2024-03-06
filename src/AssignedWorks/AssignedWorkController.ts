import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { AssignedWorkValidator } from './AssignedWorkValidator'
import { AssignedWorkService } from './Services/AssignedWorkService'
import { Asserts, Context, ApiResponse } from '@core'
import { StatusCodes } from 'http-status-codes'

@Controller('/assigned-work')
export class AssignedWorkController {
	private readonly assignedWorkService: AssignedWorkService
	private readonly assignedWorkValidator: AssignedWorkValidator

	constructor() {
		this.assignedWorkService = new AssignedWorkService()
		this.assignedWorkValidator = new AssignedWorkValidator()
	}

	@Get()
	public async get(context: Context): Promise<ApiResponse> {
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

			return new ApiResponse({ data: works, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:id')
	public async getOne(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.assignedWorkValidator.validateId(context.params.id)

			const work = await this.assignedWorkService.getWorkById(
				context.params.id
			)

			if (context.credentials.role == 'student') {
				Asserts.isAuthorized(context, work.studentId)
			} else {
				Asserts.isAuthorized(context, work.mentorIds)
			}

			return new ApiResponse({ data: work })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post()
	public async create(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.assignedWorkValidator.validateCreation(context.body)

			await this.assignedWorkService.createWork(
				context.body,
				context.credentials.userId
			)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/solve')
	public async solve(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.student(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateUpdate(context.body)

			await this.assignedWorkService.solveWork(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/check')
	public async check(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateUpdate(context.body)

			await this.assignedWorkService.checkWork(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/save')
	public async save(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.mentorOrStudent(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateUpdate(context.body)

			await this.assignedWorkService.saveProgress(
				context.body,
				context.credentials.role
			)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/archive')
	public async archive(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.id)

			await this.assignedWorkService.archiveWork(context.params.id)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:workId/transfer/:mentorId')
	public async transfer(context: Context): Promise<ApiResponse> {
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

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/shift-deadline')
	public async shiftDeadline(context: Context): Promise<ApiResponse> {
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

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Delete('/:id')
	public async delete(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.id)

			await this.assignedWorkService.deleteWork(
				context.params.id,
				context.credentials.id
			)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
