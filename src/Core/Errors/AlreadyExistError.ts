import { StatusCodes } from 'http-status-codes'

export class AlreadyExistError extends Error {
	code = StatusCodes.CONFLICT
	message: string

	constructor(message = 'Такой объект уже существует.') {
		super()
		this.message = message
	}
}
