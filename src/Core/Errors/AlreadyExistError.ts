import { StatusCodes } from 'http-status-codes'

export class AlreadyExistError extends Error {
	code = StatusCodes.CONFLICT

	constructor() {
		super()
	}
}
