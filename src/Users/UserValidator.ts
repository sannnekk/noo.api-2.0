import { z } from 'zod'
import { UserRoles, Validator } from '@core'
import { User } from './Data/User'
import { LoginCredentials } from './Data/LoginCredentials'

export class UserValidator extends Validator {
	public validateCreation(user: unknown): asserts user is User {
		const schema = z.object({
			name: z.string().min(3).max(255),
			username: z.string().min(3).max(32),
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

	public validateRegister(user: unknown): asserts user is User {
		const schema = z.object({
			name: z.string().min(3).max(255),
			username: z.string().min(3).max(32),
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
			username: z.string().min(3).max(32).optional(),
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
}
