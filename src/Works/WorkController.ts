import {
	Controller,
	ControllerResponse,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { WorkService } from './Services/WorkService'
import { WorkValidator } from './WorkValidator'
import { Asserts, Context } from '@core'
import { StatusCodes } from 'http-status-codes'

@Controller('/work')
export class WorkController {
	private readonly workService: WorkService
	private readonly workValidator: WorkValidator

	public constructor() {
		this.workService = new WorkService()
		this.workValidator = new WorkValidator()
	}

	@Get()
	public async getWorks(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.workValidator.validatePagination(context.query)
			const works = await this.workService.getWorks(context.query)

			return new ControllerResponse(works, StatusCodes.OK)
		} catch (e: any) {
			return new ControllerResponse(
				null,
				e.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Get('/:slug')
	public async getWorkBySlug(
		context: Context
	): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.workValidator.validateSlug(context.params.slug)
			const work = await this.workService.getWorkBySlug(
				context.params.slug
			)

			return new ControllerResponse(work, StatusCodes.OK)
		} catch (e: any) {
			return new ControllerResponse(
				null,
				e.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Post()
	public async createWork(
		context: Context
	): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.workValidator.validateCreation(context.body)
			await this.workService.createWork(context.body)

			return new ControllerResponse(null, StatusCodes.CREATED)
		} catch (error: any) {
			return new ControllerResponse(
				error,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Patch('/:id')
	public async updateWork(
		context: Context
	): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.workValidator.validateUpdate(context.body)
			this.workValidator.validateId(context.params.id)
			await this.workService.updateWork(context.body)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (e: any) {
			return new ControllerResponse(
				null,
				e.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Delete('/:id')
	public async deleteWork(
		context: Context
	): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			this.workValidator.validateId(context.params.id)
			await this.workService.deleteWork(context.params.id)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (e: any) {
			return new ControllerResponse(
				null,
				e.code || StatusCodes.BAD_REQUEST
			)
		}
	}
}
