import { Ulid } from '../Data/Ulid'
import { NoFilesProvidedError } from '../Errors/NoFilesProvidedError'
import { UnauthenticatedError } from '../Errors/UnauthenticatedError'
import { UnauthorizedError } from '../Errors/UnauthorizedError'
import { WrongRoleError } from '../Errors/WrongRoleError'
import { Context } from '../Request/Context'
import { JWTPayload } from './jwt'

export function student(context: Context): asserts context is Context & {
	credentials: JWTPayload & { role: 'student' }
} {
	if (context.credentials?.role !== 'student') {
		throw new WrongRoleError()
	}
}

export function notStudent(context: Context): asserts context is Context & {
	credentials: JWTPayload & { role: 'mentor' | 'teacher' | 'admin' }
} {
	if (context.credentials?.role === 'student') {
		throw new WrongRoleError()
	}
}

export function mentor(context: Context): asserts context is Context & {
	credentials: JWTPayload & { role: 'mentor' }
} {
	if (context.credentials?.role !== 'mentor') {
		throw new WrongRoleError()
	}
}

export function mentorOrStudent(
	context: Context
): asserts context is Context & {
	credentials: JWTPayload & { role: 'mentor' | 'student' }
} {
	if (
		context.credentials?.role !== 'mentor' &&
		context.credentials?.role !== 'student'
	) {
		throw new WrongRoleError()
	}
}

export function teacher(context: Context): asserts context is Context & {
	credentials: JWTPayload & { role: 'teacher' }
} {
	if (context.credentials?.role !== 'teacher') {
		throw new WrongRoleError()
	}
}

export function admin(context: Context): asserts context is Context & {
	credentials: JWTPayload & { role: 'admin' }
} {
	if (context.credentials?.role !== 'admin') {
		throw new WrongRoleError()
	}
}

export function teacherOrAdmin(context: Context): asserts context is Context & {
	credentials: JWTPayload & { role: 'teacher' | 'admin' }
} {
	if (
		context.credentials?.role !== 'teacher' &&
		context.credentials?.role !== 'admin'
	) {
		throw new WrongRoleError()
	}
}

export async function isAuthenticated(context: Context): Promise<void> {
	if (!(await context.isAuthenticated())) {
		throw new UnauthenticatedError()
	}
}

export function isAuthorized(context: Context, id: Ulid | Ulid[]): void {
	if (
		Array.isArray(id) &&
		!id.some((_id) => context.credentials?.userId === _id)
	) {
		throw new UnauthorizedError()
	} else if (!Array.isArray(id) && context.credentials?.userId !== id) {
		throw new UnauthorizedError()
	}
}
