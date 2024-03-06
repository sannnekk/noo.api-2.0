import { StatusCodes } from 'http-status-codes'

export class WorkIsArchived extends Error {
	code = StatusCodes.BAD_REQUEST
	message: string

	constructor(message = 'The work is archived') {
		super()
		this.message = message
	}
}
