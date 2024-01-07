import {
	Controller,
	ControllerResponse,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { Context } from '@core'
import { UserService } from './Services/UserService'
import { UserValidator } from './UserValidator'
import { Asserts } from '@core'
import { StatusCodes } from 'http-status-codes'

@Controller('/user')
export class UserController {
	private readonly userValidator: UserValidator
	private readonly userService: UserService

	constructor() {
		this.userValidator = new UserValidator()
		this.userService = new UserService()
	}

	@Post()
	async create(context: Context): Promise<ControllerResponse> {
		try {
			this.userValidator.validateCreation(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacher(context)
			await this.userService.create(context.body)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}

		return new ControllerResponse(null, StatusCodes.CREATED)
	}

	@Post('/login')
	async login(context: Context): Promise<ControllerResponse> {
		try {
			this.userValidator.validateLogin(context.body)
			const payload = await this.userService.login(context.body)

			return new ControllerResponse(payload, StatusCodes.OK)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Post('/register')
	async register(context: Context): Promise<ControllerResponse> {
		try {
			this.userValidator.validateRegister(context.body)
			context.body.role = 'student'
			await this.userService.create(context.body)

			return new ControllerResponse(null, StatusCodes.CREATED)
		} catch (error: any) {
			return new ControllerResponse(
				error,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Get('/:slug')
	async getBySlug(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.userValidator.validateSlug(context.params.slug)
			const user = await this.userService.getBySlug(context.params.slug)
			return new ControllerResponse(user)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Patch('/:id')
	async update(context: Context): Promise<ControllerResponse> {
		try {
			this.userValidator.validateId(context.params.id)
			this.userValidator.validateUpdate(context.body)
			Asserts.isAuthorized(context, context.params.id)
			await this.userService.update(context.body)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Delete('/:id')
	async delete(context: Context): Promise<ControllerResponse> {
		try {
			this.userValidator.validateId(context.params.id)
			Asserts.isAuthorized(context, context.params.id)
			await this.userService.delete(context.params.id)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (error: any) {
			return new ControllerResponse(
				null,
				error.code || StatusCodes.BAD_REQUEST
			)
		}
	}
}
