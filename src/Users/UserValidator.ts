import { z } from 'zod'
import { ErrorConverter, UserRoles, Validator } from '@core'
import { User } from './Data/User'
import { LoginCredentials } from './Data/LoginCredentials'
import { ForgotPasswordCredentials } from './Data/ForgotPasswordCredentials'

@ErrorConverter()
export class UserValidator extends Validator {
	public validateCreation(user: unknown): asserts user is User {
		const schema = z.object({
			name: z.string().min(3).max(255),
			username: z
				.string()
				.min(3)
				.max(32)
				.regex(/^[A-Za-z0-9_-]+$/i),
			email: z.string().email(),
			role: z.enum(Object.keys(UserRoles) as any),
			password: z.string().min(8).max(255),
			isBlocked: z.boolean().optional(),
			forbidden: z.number().optional(),
		})

		schema.parse(user)
	}

	public validateLogin(
		user: unknown
	): asserts user is LoginCredentials {
		const schema = z.object({
			usernameOrEmail: z.string().min(3).max(32),
			password: z.string().min(8).max(255),
		})

		schema.parse(user)
	}

	public validateVerification(
		data: unknown
	): asserts data is { username: string; token: string } {
		const schema = z.object({
			username: z.string().min(3).max(32),
			token: z.string().min(8).max(255),
		})

		schema.parse(data)
	}

	public validateRegister(user: unknown): asserts user is User {
		const schema = z.object({
			name: z.string().min(3).max(255),
			username: z
				.string()
				.min(3)
				.max(32)
				.regex(/^[A-Za-z0-9_-]+$/i),
			email: z.string().email(),
			password: z.string().min(8).max(255),
		})

		schema.parse(user)
	}

	public validateUpdate(user: unknown): asserts user is User {
		const schema = z.object({
			id: z.string().ulid(),
			slug: z.string().min(3).max(32).optional(),
			name: z.string().min(3).max(255).optional(),
			username: z
				.string()
				.min(3)
				.max(32)
				.regex(/^[A-Za-z0-9_-]+$/i)
				.optional(),
			email: z.string().email().optional(),
			role: z.enum(Object.keys(UserRoles) as any).optional(),
			password: z.string().min(8).max(255).optional(),
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
			email: z.string().email(),
		})

		schema.parse(data)
	}
}
