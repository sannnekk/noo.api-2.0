import { StatusCodes } from 'http-status-codes'

export class DeadlineAlreadyShiftedError extends Error {
	code = StatusCodes.CONFLICT
	message: string

	constructor(
		message = 'The deadline for this assigned work has already been shifted'
	) {
		super()
		this.message = message
	}
}
