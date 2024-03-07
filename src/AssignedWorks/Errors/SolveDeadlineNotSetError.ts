import { StatusCodes } from 'http-status-codes'

export class SolveDeadlineNotSetError extends Error {
	code = StatusCodes.BAD_REQUEST
	message: string

	constructor(message = 'Срок выполнения задания не установлен.') {
		super()
		this.message = message
	}
}
