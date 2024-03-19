import { Context } from '@core'
import { UserService } from './Services/UserService'
import { UserValidator } from './UserValidator'
import { Asserts } from '@core'
import {
	Req,
	Res,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
} from '@decorators/express'
import { Request, Response } from 'express'
import { getErrorData } from '@modules/Core/Response/helpers'

@Controller('/user')
export class UserController {
	private readonly userValidator: UserValidator
	private readonly userService: UserService

	constructor() {
		this.userValidator = new UserValidator()
		this.userService = new UserService()
	}

	@Post('/')
	async create(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			this.userValidator.validateCreation(context.body)
			Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			await this.userService.create(context.body)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/auth/login')
	async login(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			this.userValidator.validateLogin(context.body)

			const payload = await this.userService.login(context.body)

			res.status(200).send({ data: payload })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/auth/register')
	async register(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			this.userValidator.validateRegister(context.body)
			await this.userService.register(context.body)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/auth/resend-verification')
	async resendVerification(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			this.userValidator.validateResendVerification(context.body)
			await this.userService.resendVerification(context.body.email)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/auth/verify')
	async verify(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			this.userValidator.validateVerification(context.body)

			await this.userService.verify(
				context.body.username,
				context.body.token
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Post('/auth/forgot-password')
	async forgotPassword(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			this.userValidator.validateForgotPassword(context.body)
			await this.userService.forgotPassword(context.body.email)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/:username')
	async getByUsername(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			this.userValidator.validateSlug(context.params.username)

			const user = await this.userService.getByUsername(
				context.params.username
			)

			res.status(200).send({ data: user })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:username/verify-manual')
	async verifyManual(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			this.userValidator.validateSlug(context.params.username)

			await this.userService.verifyManual(context.params.username)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/mentor/search')
	async getMentors(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			const pagination = this.userValidator.validatePagination(
				context.query
			)

			const mentors = await this.userService.getMentors(pagination)

			const meta = await this.userService.getLastRequestMeta()

			res.status(200).send({ data: mentors, meta })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/student/search')
	async getStudents(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			const pagination = this.userValidator.validatePagination(
				context.query
			)

			const students = await this.userService.getStudents(pagination)

			const meta = await this.userService.getLastRequestMeta()

			res.status(200).send({ data: students, meta })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/student/search/own')
	async getMyStudents(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			Asserts.mentor(context)

			const pagination = this.userValidator.validatePagination(
				context.query
			)

			const students = await this.userService.getStudentsOf(
				context.credentials.userId,
				pagination
			)

			const meta = await this.userService.getLastRequestMeta()

			res.status(200).send({ data: students, meta })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Get('/')
	async getUsers(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)
			Asserts.notStudent(context)
			const pagination = this.userValidator.validatePagination(
				context.query
			)

			const users = await this.userService.getUsers(pagination)

			const meta = await this.userService.getLastRequestMeta()

			res.status(200).send({ data: users, meta })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:id')
	async update(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			this.userValidator.validateId(context.params.id)
			this.userValidator.validateUpdate(context.body)

			if (!['teacher', 'admin'].includes(context.credentials.role)) {
				Asserts.isAuthorized(context, context.params.id)
			}

			await this.userService.update(context.body)

			res.status(200).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Patch('/:studentId/assign-mentor/:mentorId')
	async assignMentor(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.notStudent(context)
			this.userValidator.validateId(context.params.studentId)
			this.userValidator.validateId(context.params.mentorId)

			await this.userService.assignMentor(
				context.params.studentId,
				context.params.mentorId
			)

			res.status(201).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}

	@Delete('/:id')
	async delete(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			Asserts.isAuthenticated(context)
			this.userValidator.validateId(context.params.id)

			if (!['teacher', 'admin'].includes(context.credentials.role)) {
				Asserts.isAuthorized(context, context.params.id)
			}

			await this.userService.delete(context.params.id)

			res.status(200).send({ data: null })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}
}
