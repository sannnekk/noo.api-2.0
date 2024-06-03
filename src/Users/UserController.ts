import { Context } from '@modules/core/Request/Context'
import { UserService } from './Services/UserService'
import { UserValidator } from './UserValidator'
import * as Asserts from '@modules/core/Security/asserts'
import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
} from 'express-controller-decorator'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'

@Controller('/user')
export class UserController {
	private readonly userValidator: UserValidator
	private readonly userService: UserService

	constructor() {
		this.userValidator = new UserValidator()
		this.userService = new UserService()
	}

	@Post('/auth/login')
	async login(context: Context): Promise<ApiResponse> {
		try {
			const loginDTO = this.userValidator.parseLogin(context.body)

			const payload = await this.userService.login(loginDTO)

			return new ApiResponse({ data: payload })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/auth/register')
	async register(context: Context): Promise<ApiResponse> {
		try {
			const registerDTO = this.userValidator.parseRegister(context.body)
			await this.userService.register(registerDTO)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/auth/check-username/:username')
	async checkUsername(context: Context): Promise<ApiResponse> {
		try {
			const username = this.userValidator.parseSlug(context.params.username)

			const exists = await this.userService.checkUsername(username)

			return new ApiResponse({ data: { exists } })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/auth/resend-verification')
	async resendVerification(context: Context): Promise<ApiResponse> {
		try {
			const resendVerificationDTO = this.userValidator.parseResendVerification(
				context.body
			)
			await this.userService.resendVerification(resendVerificationDTO.email)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/auth/verify')
	async verify(context: Context): Promise<ApiResponse> {
		try {
			const verificationDTO = this.userValidator.parseVerification(context.body)

			await this.userService.verify(
				verificationDTO.username,
				verificationDTO.token
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Post('/auth/forgot-password')
	async forgotPassword(context: Context): Promise<ApiResponse> {
		try {
			const forgotPasswordDTO = this.userValidator.validateForgotPassword(
				context.body
			)

			await this.userService.forgotPassword(forgotPasswordDTO.email)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/:username')
	async getByUsername(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const username = this.userValidator.parseSlug(context.params.username)

			const user = await this.userService.getByUsername(username)

			return new ApiResponse({ data: user })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:username/verify-manual')
	async verifyManual(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			const username = this.userValidator.parseSlug(context.params.username)

			await this.userService.verifyManual(username)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/mentor/search')
	async getMentors(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			const pagination = this.userValidator.parsePagination(context.query)

			const { mentors, meta } = await this.userService.getMentors(pagination)

			return new ApiResponse({ data: mentors, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/teacher/search')
	async getTeachers(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			const pagination = this.userValidator.parsePagination(context.query)

			const { teachers, meta } = await this.userService.getTeachers(pagination)

			return new ApiResponse({ data: teachers, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/student/search')
	async getStudents(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			const pagination = this.userValidator.parsePagination(context.query)

			const { students, meta } = await this.userService.getStudents(pagination)

			return new ApiResponse({ data: students, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/student/search/own')
	async getMyStudents(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.mentor(context)

			const pagination = this.userValidator.parsePagination(context.query)

			const { students, meta } = await this.userService.getStudentsOf(
				context.credentials.userId,
				pagination
			)

			return new ApiResponse({ data: students, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Get('/')
	async getUsers(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			const pagination = this.userValidator.parsePagination(context.query)

			const { users, meta } = await this.userService.getUsers(pagination)

			return new ApiResponse({ data: users, meta })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:id')
	async update(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const id = this.userValidator.parseId(context.params.id)
			const updateUserDTO = this.userValidator.parseUpdate(context.body)

			if (!['teacher', 'admin'].includes(context.credentials!.role)) {
				Asserts.isAuthorized(context, id)
				updateUserDTO.role = undefined
			}

			await this.userService.update(
				id,
				updateUserDTO,
				context.credentials!.role
			)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Patch('/:studentId/assign-mentor/:mentorId')
	async assignMentor(context: Context): Promise<ApiResponse> {
		try {
			Asserts.notStudent(context)
			const studentId = this.userValidator.parseId(context.params.studentId)
			const mentorId = this.userValidator.parseId(context.params.mentorId)

			await this.userService.assignMentor(studentId, mentorId)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Delete('/:id')
	async delete(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const id = this.userValidator.parseId(context.params.id)

			if (!['teacher', 'admin'].includes(context.credentials!.role)) {
				Asserts.isAuthorized(context, id)
			}

			await this.userService.delete(id)

			return new ApiResponse()
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
