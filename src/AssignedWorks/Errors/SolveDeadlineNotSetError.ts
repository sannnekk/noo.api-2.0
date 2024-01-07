import { StatusCodes } from 'http-status-codes'

export class SolveDeadlineNotSetError extends Error {
	code = StatusCodes.BAD_REQUEST

	constructor() {
		super()
	}
}
