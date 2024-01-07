import { StatusCodes } from 'http-status-codes'

export class UnauthorizedError extends Error {
	code = StatusCodes.FORBIDDEN

	constructor() {
		super()
	}
}
