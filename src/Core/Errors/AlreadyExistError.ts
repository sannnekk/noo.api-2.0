import { StatusCodes } from 'http-status-codes'

export class AlreadyExistError extends Error {
	code = StatusCodes.CONFLICT
	message: string

	constructor(message = 'The resource already exists') {
		super()
		this.message = message
	}
}
