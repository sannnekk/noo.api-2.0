import { StatusCodes } from 'http-status-codes'

export class NotFoundError extends Error {
	readonly code: number = StatusCodes.NOT_FOUND

	constructor() {
		super()
		this.name = 'NotFoundError'
	}
}
