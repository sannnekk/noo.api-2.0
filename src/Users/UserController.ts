import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { ApiResponse, Context } from '@core'
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
	async create(context: Context): Promise<ApiResponse> {
		try {
			this.userValidator.validateCreation(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			await this.userService.create(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/login')
	async login(context: Context): Promise<ApiResponse> {
		try {
			this.userValidator.validateLogin(context.body)

			const payload = await this.userService.login(context.body)

			return new ApiResponse({ data: payload })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/register')
	async register(context: Context): Promise<ApiResponse> {
		try {
			this.userValidator.validateRegister(context.body)
			await this.userService.register(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/forgot-password')
	async forgotPassword(context: Context): Promise<ApiResponse> {
		try {
			this.userValidator.validateForgotPassword(context.body)
			await this.userService.forgotPassword(context.body.email)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:username')
	async getByUsername(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.userValidator.validateSlug(context.params.username)

			const user = await this.userService.getByUsername(
				context.params.username
			)

			return new ApiResponse({ data: user })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/mentor/search')
	async getMentors(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			this.userValidator.validatePagination(context.query)

			const mentors = await this.userService.getMentors(context.query)

			const meta = await this.userService.getLastRequestMeta()

			return new ApiResponse({ data: mentors, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/student/search')
	async getStudents(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			this.userValidator.validatePagination(context.query)

			const students = await this.userService.getStudents(context.query)

			const meta = await this.userService.getLastRequestMeta()

			return new ApiResponse({ data: students, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get()
	async getUsers(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			this.userValidator.validatePagination(context.query)

			const users = await this.userService.getUsers(
				context.query,
				context.credentials.role,
				context.credentials.userId
			)

			const meta = await this.userService.getLastRequestMeta()

			return new ApiResponse({ data: users, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id')
	async update(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.userValidator.validateId(context.params.id)
			this.userValidator.validateUpdate(context.body)

			if (!['teacher', 'admin'].includes(context.credentials.role)) {
				Asserts.isAuthorized(context, context.params.id)
			}

			await this.userService.update(context.body)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:studentId/assign-mentor/:mentorId')
	async assignMentor(context: Context): Promise<ApiResponse> {
		try {
			Asserts.teacherOrAdmin(context)
			this.userValidator.validateId(context.params.studentId)
			this.userValidator.validateId(context.params.mentorId)

			await this.userService.assignMentor(
				context.params.studentId,
				context.params.mentorId
			)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Delete('/:id')
	async delete(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			this.userValidator.validateId(context.params.id)

			if (!['teacher', 'admin'].includes(context.credentials.role)) {
				Asserts.isAuthorized(context, context.params.id)
			}

			await this.userService.delete(context.params.id)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
