import {
	Controller,
	ControllerResponse,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { AssignedWorkValidator } from './AssignedWorkValidator'
import { AssignedWorkService } from './Services/AssignedWorkService'
import { Asserts, Context } from '@core'
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
	public async get(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.assignedWorkValidator.validatePagination(context.query)

			const works = await this.assignedWorkService.getWorks(
				context.credentials.userId,
				context.credentials.role,
				context.query
			)

			return new ControllerResponse(works, StatusCodes.OK)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Get('/:id')
	public async getOne(context: Context): Promise<ControllerResponse> {
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

			return new ControllerResponse(work, StatusCodes.OK)
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
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.assignedWorkValidator.validateCreation(context.body)

			await this.assignedWorkService.createWork(
				context.body,
				context.credentials.userId
			)

			return new ControllerResponse(null, StatusCodes.CREATED)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Patch('/:id/solve')
	public async solve(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.student(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateUpdate(context.body)

			await this.assignedWorkService.solveWork(context.body)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Patch('/:id/check')
	public async check(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.id)
			this.assignedWorkValidator.validateUpdate(context.body)

			await this.assignedWorkService.checkWork(context.body)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Patch('/:workId/transfer/:mentorId')
	public async transfer(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.workId)
			this.assignedWorkValidator.validateId(context.params.mentorId)

			await this.assignedWorkService.transferWorkToAnotherMentor(
				context.params.workId,
				context.params.mentorId
			)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Patch('/:id/shift-deadline')
	public async shiftDeadline(
		context: Context
	): Promise<ControllerResponse> {
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

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Delete('/:id')
	public async delete(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.mentor(context)
			this.assignedWorkValidator.validateId(context.params.id)

			await this.assignedWorkService.deleteWork(
				context.params.id,
				context.credentials.id
			)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}
}
