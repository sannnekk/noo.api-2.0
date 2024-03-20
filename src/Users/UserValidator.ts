import { z } from 'zod'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { UserRoles } from '@modules/Core/Security/roles'
import { User } from './Data/User'
import { LoginCredentials } from './Data/LoginCredentials'
import { ForgotPasswordCredentials } from './Data/ForgotPasswordCredentials'

@ErrorConverter()
export class UserValidator extends Validator {
	public validateCreation(user: unknown): asserts user is User {
		const schema = z.object({
			name: z
				.string()
				.min(3, {
					message: 'ФИО должен быть длиннее двух символов',
				})
				.max(255, {
					message: 'ФИО должен быть короче 32 символов',
				}),
			username: z
				.string()
				.min(3, {
					message: 'Никнейм должен быть длиннее двух символов',
				})
				.max(32, {
					message: 'Никнейм должен быть короче 32 символов',
				})
				.regex(/^[A-Za-z0-9_-]+$/i),
			email: z.string().email({ message: 'Неверный формат почты' }),
			role: z.enum(Object.keys(UserRoles) as any),
			password: z
				.string()
				.min(8, {
					message: 'Пароль должен быть 8 символов или длиннее',
				})
				.max(255, {
					message: 'Пароль должен быть короче 255 символов',
				}),
			isBlocked: z.boolean().optional(),
			forbidden: z.number().optional(),
		})

		schema.parse(user)
	}

	public validateLogin(
		user: unknown
	): asserts user is LoginCredentials {
		const schema = z.object({
			usernameOrEmail: z
				.string()
				.min(3, {
					message: 'Логин должен быть длиннее двух символов',
				})
				.max(100, {
					message: 'Логин должен быть короче 100 символов',
				}),
			password: z
				.string()
				.min(8, {
					message: 'Пароль должен быть 8 символов или длиннее',
				})
				.max(255, {
					message: 'Пароль должен быть короче 255 символов',
				}),
		})

		schema.parse(user)
	}

	public validateVerification(
		data: unknown
	): asserts data is { username: string; token: string } {
		const schema = z.object({
			username: z
				.string()
				.min(3, { message: 'Неверный никнейм' })
				.max(32, { message: 'Неверный никнейм' }),
			token: z
				.string()
				.min(8, { message: 'Неверный токен' })
				.max(255, { message: 'Неверный токен' }),
		})

		schema.parse(data)
	}

	public validateResendVerification(
		data: unknown
	): asserts data is { email: string } {
		const schema = z.object({
			email: z.string().email({
				message: 'Неверный формат почты',
			}),
		})

		schema.parse(data)
	}

	public validateRegister(user: unknown): asserts user is User {
		const schema = z.object({
			name: z
				.string()
				.min(3, {
					message: 'ФИО должно быть длиннее двух символов',
				})
				.max(255, {
					message: 'ФИО должно быть короче 255 символов',
				}),
			username: z
				.string()
				.min(3, {
					message: 'Никнейм должен быть длиннее двух символов',
				})
				.max(32, {
					message: 'Никнейм должен быть короче 32 символов',
				})
				.regex(/^[A-Za-z0-9_-]+$/i, {
					message: 'Неверный формат никнейма',
				}),
			email: z.string().email({
				message: 'Неверный формат почты',
			}),
			password: z
				.string()
				.min(8, {
					message: 'Пароль должен быть 8 символов или длиннее',
				})
				.max(255, {
					message: 'Пароль должен быть короче 255 символов',
				}),
		})

		schema.parse(user)
	}

	public validateUpdate(user: unknown): asserts user is User {
		const schema = z.object({
			id: z.string().ulid(),
			slug: z.string().min(3).max(32).optional(),
			name: z
				.string()
				.min(3, {
					message: 'ФИО должно быть длиннее двух символов',
				})
				.max(255, {
					message: 'ФИО должно быть короче 255 символов',
				})
				.optional(),
			username: z
				.string()
				.min(3, {
					message: 'Никнейм должен быть длиннее двух символов',
				})
				.max(32, {
					message: 'Никнейм должен быть короче 32 символов',
				})
				.regex(/^[A-Za-z0-9_-]+$/i, {
					message: 'Неверный формат никнейма',
				})
				.optional(),
			email: z
				.string()
				.email({
					message: 'Неверный формат почты',
				})
				.optional(),
			role: z.enum(Object.keys(UserRoles) as any).optional(),
			password: z
				.string()
				.min(8, {
					message: 'Пароль должен быть 8 символов или длиннее',
				})
				.max(255, {
					message: 'Пароль должен быть короче 255 символов',
				})
				.optional(),
			isBlocked: z.boolean().optional(),
			forbidden: z.number().optional(),
			createdAt: z.date().optional(),
			updatedAt: z.date().optional(),
		})

		schema.parse(user)
	}

	public validateForgotPassword(
		data: unknown
	): asserts data is ForgotPasswordCredentials {
		const schema = z.object({
			email: z.string().email({
				message: 'Неверный формат почты',
			}),
		})

		schema.parse(data)
	}
}
