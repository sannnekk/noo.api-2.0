import { StatusCodes } from 'http-status-codes'

export class RoleChangedButNotReloggedInError extends Error {
	readonly code: number = StatusCodes.CONFLICT
	message: string

	constructor(
		message = 'Похоже, у этого аккаунта изменилась роль. Пожалуйста, перезайдите.'
	) {
		super()
		this.message = message
	}
}
