import { StatusCodes } from 'http-status-codes'

export class WrongRoleError extends Error {
	code = StatusCodes.FORBIDDEN
	message: string

	constructor(
		message = 'You do not have the right role to perform this action'
	) {
		super()
		this.message = message
	}
}
