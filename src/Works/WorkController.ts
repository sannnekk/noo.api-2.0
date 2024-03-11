import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { WorkService } from './Services/WorkService'
import { WorkValidator } from './WorkValidator'
import { ApiResponse, Asserts, Context } from '@core'

@Controller('/work')
export class WorkController {
	private readonly workService: WorkService
	private readonly workValidator: WorkValidator

	public constructor() {
		this.workService = new WorkService()
		this.workValidator = new WorkValidator()
	}

	@Get()
	public async getWorks(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			const pagination = this.workValidator.validatePagination(
				context.query
			)

			const works = await this.workService.getWorks(pagination)
			const meta = await this.workService.getLastRequestMeta()

			return new ApiResponse({ data: works, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:slug')
	public async getWorkBySlug(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)

			this.workValidator.validateSlug(context.params.slug)

			const work = await this.workService.getWorkBySlug(
				context.params.slug
			)

			return new ApiResponse({ data: work })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post()
	public async createWork(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			this.workValidator.validateCreation(context.body)

			await this.workService.createWork(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/copy/:slug')
	public async copyWork(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			this.workValidator.validateSlug(context.params.slug)

			await this.workService.copyWork(context.params.slug)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id')
	public async updateWork(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			this.workValidator.validateUpdate(context.body)
			this.workValidator.validateId(context.params.id)

			await this.workService.updateWork(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Delete('/:id')
	public async deleteWork(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)

			this.workValidator.validateId(context.params.id)

			await this.workService.deleteWork(context.params.id)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
