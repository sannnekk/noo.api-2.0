import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { AssignedWorkValidator } from './AssignedWorkValidator'
import { AssignedWorkService } from './Services/AssignedWorkService'
import * as Asserts from '@modules/core/Security/asserts'
import { Context } from '@modules/core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { AssignedWorkOptions } from './AssignedWorkOptions'

@Controller('/assigned-work')
export class AssignedWorkController {
	private readonly assignedWorkService: AssignedWorkService
	private readonly assignedWorkValidator: AssignedWorkValidator

	constructor() {
		this.assignedWorkService = new AssignedWorkService()
		this.assignedWorkValidator = new AssignedWorkValidator()
	}

	@Get('/')
	public async get(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const pagination = this.assignedWorkValidator.parsePagination(
				context.query
			)

			const { assignedWorks, meta } = await this.assignedWorkService.getWorks(
				context.credentials!.userId,
				context.credentials!.role,
				pagination
			)

			return new ApiResponse({ data: assignedWorks, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:id')
	public async getOne(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const workId = this.assignedWorkValidator.parseId(context.params.id)

			const work = await this.assignedWorkService.getWorkById(
				workId,
				context.credentials!.role
			)

			if (context.credentials!.role == 'student') {
				Asserts.isAuthorized(context, work.studentId)
			}

			return new ApiResponse({ data: work })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/')
	public async create(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const options = this.assignedWorkValidator.parseCreation(context.body)

			await this.assignedWorkService.createWork(options)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/:id/remake')
	public async remake(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.student(context)
			const workId = this.assignedWorkValidator.parseId(context.params.id)
			const options = this.assignedWorkValidator.parseRemake(context.body)

			await this.assignedWorkService.remakeWork(
				workId,
				context.credentials.userId,
				options
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/:materialSlug')
	public async getOrCreate(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.student(context)
			const materialSlug = this.assignedWorkValidator.parseSlug(
				context.params.materialSlug
			)

			const { link } = await this.assignedWorkService.getOrCreateWork(
				materialSlug,
				context.credentials.userId
			)

			return new ApiResponse({ data: { link } })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/solve')
	public async solve(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.student(context)
			const workId = this.assignedWorkValidator.parseId(context.params.id)
			const options = this.assignedWorkValidator.parseSolve(context.body)

			await this.assignedWorkService.solveWork(
				workId,
				options,
				context.credentials!.userId
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/check')
	public async check(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			const workId = this.assignedWorkValidator.parseId(context.params.id)
			const checkOptions = this.assignedWorkValidator.parseCheck(context.body)

			await this.assignedWorkService.checkWork(workId, checkOptions)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/save')
	public async save(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentorOrStudent(context)
			const workId = this.assignedWorkValidator.parseId(context.params.id)
			const saveOptions = this.assignedWorkValidator.parseSave(context.body)

			await this.assignedWorkService.saveProgress(
				workId,
				saveOptions,
				context.credentials.role
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/archive')
	public async archive(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			const workId = this.assignedWorkValidator.parseId(context.params.id)

			await this.assignedWorkService.archiveWork(workId)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:workId/transfer/:mentorId')
	public async transfer(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			const workId = this.assignedWorkValidator.parseId(context.params.workId)
			const mentorId = this.assignedWorkValidator.parseId(
				context.params.mentorId
			)

			await this.assignedWorkService.transferWorkToAnotherMentor(
				workId,
				mentorId,
				context.credentials.userId
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id/shift-deadline')
	public async shiftDeadline(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentorOrStudent(context)
			const workId = this.assignedWorkValidator.parseId(context.params.id)

			await this.assignedWorkService.shiftDeadline(
				workId,
				AssignedWorkOptions.deadlineShift,
				context.credentials.role,
				context.credentials.userId
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Delete('/:id')
	public async delete(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			const workId = this.assignedWorkValidator.parseId(context.params.id)

			await this.assignedWorkService.deleteWork(workId, context.credentials.id)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
