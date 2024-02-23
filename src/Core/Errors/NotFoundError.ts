import { StatusCodes } from 'http-status-codes'

export class NotFoundError extends Error {
	readonly code: number = StatusCodes.NOT_FOUND
	message: string

	constructor(message = 'The requested resource was not found') {
		super()
		this.message = message
	}
}
