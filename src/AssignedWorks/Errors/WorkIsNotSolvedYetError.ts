import { StatusCodes } from 'http-status-codes'

export class WorkIsNotSolvedYetError extends Error {
	code = StatusCodes.CONFLICT
	message: string

	constructor(message = 'The work is not solved yet') {
		super()
		this.message = message
	}
}
