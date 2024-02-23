import { StatusCodes } from 'http-status-codes'

export class SolveDeadlineNotSetError extends Error {
	code = StatusCodes.BAD_REQUEST
	message: string

	constructor(
		message = 'The solve deadline for this assigned work is not set'
	) {
		super()
		this.message = message
	}
}
