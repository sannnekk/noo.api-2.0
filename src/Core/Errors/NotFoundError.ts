import { StatusCodes } from 'http-status-codes'

export class NotFoundError extends Error {
	readonly code: number = StatusCodes.NOT_FOUND
	message: string

	constructor(message = 'Запрашиваемый ресурс не найден.') {
		super()
		this.message = message
	}
}
