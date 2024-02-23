import { StatusCodes } from 'http-status-codes'

export class InvalidRequestError extends Error {
	code = StatusCodes.BAD_REQUEST
	message: string

	constructor(message = 'Invalid request data') {
		super(message)
		this.message = message
	}
}
