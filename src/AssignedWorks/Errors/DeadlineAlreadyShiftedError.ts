import { StatusCodes } from 'http-status-codes'

export class DeadlineAlreadyShiftedError extends Error {
	code = StatusCodes.CONFLICT
	message: string

	constructor(message = 'Дедлайн уже был сдвинут.') {
		super()
		this.message = message
	}
}
