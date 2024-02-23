import { StatusCodes } from 'http-status-codes'

export class UnauthenticatedError extends Error {
	code = StatusCodes.UNAUTHORIZED
	message: string

	constructor(message = 'You are not authenticated') {
		super()
		this.message = message
	}
}
