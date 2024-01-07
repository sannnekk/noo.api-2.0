import { StatusCodes } from 'http-status-codes'

export class WorkAlreadyCheckedError extends Error {
	code = StatusCodes.CONFLICT

	constructor() {
		super()
	}
}
