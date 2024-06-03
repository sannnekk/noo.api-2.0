import { z } from 'zod'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { UserRoles } from '@modules/Core/Security/roles'
import { LoginDTO } from './DTO/LoginDTO'
import { ForgotPasswordDTO } from './DTO/ForgotPasswordDTO'
import { ResendVerificationDTO } from './DTO/ResendVerificationDTO'
import { VerificationDTO } from './DTO/VerificationDTO'
import { RegisterDTO } from './DTO/RegisterDTO'
import { UpdateUserDTO } from './DTO/UpdateUserDTO'

@ErrorConverter()
export class UserValidator extends Validator {
	public userRoleScheme = z.enum(
		Object.keys(UserRoles) as [string, ...string[]]
	)

	public passwordScheme = z
		.string()
		.min(8, {
			message: 'Пароль должен быть 8 символов или длиннее',
		})
		.max(64, {
			message: 'Пароль должен быть короче 64 символов',
		})
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
			message:
				'Пароль должен содержать хотя бы одну цифру, одну заглавную и одну строчную букву',
		})

	public usernameScheme = z
		.string()
		.min(3, {
			message: 'Никнейм должен быть длиннее двух символов',
		})
		.max(32, {
			message: 'Никнейм должен быть короче 32 символов',
		})
		.regex(/^[A-Za-z0-9_-]+$/i)

	public emailScheme = z.string().email({ message: 'Неверный формат почты' })

	public registerScheme = z.object({
		name: z
			.string()
			.min(3, {
				message: 'ФИО должен быть длиннее двух символов',
			})
			.max(255, {
				message: 'ФИО должен быть короче 32 символов',
			}),
		username: this.usernameScheme,
		email: this.emailScheme,
		password: this.passwordScheme,
	})

	public updateScheme = z.object({
		id: z.string().ulid(),
		email: this.emailScheme.optional(),
		name: z.string().optional(),
		telegramUsername: z.string().optional(),
		password: this.passwordScheme.optional(),
		role: z.nativeEnum(UserRoles).optional(),
		isBlocked: z.boolean().optional(),
	})

	public loginScheme = z.object({
		usernameOrEmail: this.usernameScheme.or(this.emailScheme),
		password: this.passwordScheme,
	})

	public verificationScheme = z.object({
		token: z
			.string()
			.min(8, { message: 'Неверный токен' })
			.max(255, { message: 'Неверный токен' }),
		username: this.usernameScheme,
	})

	public resendVerificationScheme = z.object({
		email: this.emailScheme,
	})

	public forgotPasswordScheme = z.object({
		email: this.emailScheme,
	})

	public parseRegister(data: unknown): RegisterDTO {
		return this.parse<RegisterDTO>(data, this.registerScheme)
	}

	public parseLogin(user: unknown): LoginDTO {
		return this.parse<LoginDTO>(user, this.loginScheme)
	}

	public parseVerification(data: unknown): VerificationDTO {
		return this.parse<VerificationDTO>(data, this.verificationScheme)
	}

	public parseResendVerification(data: unknown): ResendVerificationDTO {
		return this.parse<ResendVerificationDTO>(
			data,
			this.resendVerificationScheme
		)
	}

	public parseUpdate(user: unknown): UpdateUserDTO {
		return this.parse<UpdateUserDTO>(user, this.updateScheme)
	}

	public validateForgotPassword(data: unknown): ForgotPasswordDTO {
		return this.parse<ForgotPasswordDTO>(data, this.forgotPasswordScheme)
	}
}
