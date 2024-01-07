import { StatusCodes } from 'http-status-codes'

export class CheckDeadlineNotSetError extends Error {
	code = StatusCodes.BAD_REQUEST

	constructor() {
		super()
	}
}
