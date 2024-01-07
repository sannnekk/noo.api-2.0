import { StatusCodes } from 'http-status-codes'

export class WorkIsNotSolvedYetError extends Error {
	code = StatusCodes.CONFLICT

	constructor() {
		super()
	}
}
