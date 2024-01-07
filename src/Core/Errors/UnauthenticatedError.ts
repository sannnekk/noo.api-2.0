import { StatusCodes } from 'http-status-codes'

export class UnauthenticatedError extends Error {
	code = StatusCodes.UNAUTHORIZED

	constructor() {
		super()
	}
}
