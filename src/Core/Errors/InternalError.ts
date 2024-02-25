import { StatusCodes } from 'http-status-codes'

export class InternalError extends Error {
	public code = StatusCodes.INTERNAL_SERVER_ERROR
	public message

	constructor(message: string = 'Internal Server Error') {
		super()
		this.message = message
	}
}
