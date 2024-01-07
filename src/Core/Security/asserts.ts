import { Ulid } from '../Data/Ulid'
import { UnauthenticatedError } from '../Errors/UnauthenticatedError'
import { UnauthorizedError } from '../Errors/UnauthorizedError'
import { WrongRoleError } from '../Errors/WrongRoleError'
import { Context } from '../Request/Context'
import { JWTPayload } from './jwt'

export function student(
	context: Context
): asserts context is Context & { credentials: JWTPayload } {
	if (context.credentials?.role !== 'student') {
		throw new WrongRoleError()
	}
}

export function mentor(
	context: Context
): asserts context is Context & { credentials: JWTPayload } {
	if (context.credentials?.role !== 'mentor') {
		throw new WrongRoleError()
	}
}

export function teacher(
	context: Context
): asserts context is Context & { credentials: JWTPayload } {
	if (context.credentials?.role !== 'teacher') {
		throw new WrongRoleError()
	}
}

export function admin(
	context: Context
): asserts context is Context & { credentials: JWTPayload } {
	if (context.credentials?.role !== 'admin') {
		throw new WrongRoleError()
	}
}

export function isAuthenticated(
	context: Context
): asserts context is Context & { credentials: JWTPayload } {
	if (!context.isAuthenticated()) {
		throw new UnauthenticatedError()
	}
}

export function isAuthorized(
	context: Context,
	id: Ulid | Ulid[]
): void {
	if (
		Array.isArray(id) &&
		!id.some((_id) => context.credentials?.userId === _id)
	) {
		throw new UnauthorizedError()
	} else if (context.credentials?.userId !== id) {
		throw new UnauthorizedError()
	}
}
