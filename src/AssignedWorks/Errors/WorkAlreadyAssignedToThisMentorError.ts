import { StatusCodes } from 'http-status-codes'

export class WorkAlreadyAssignedToThisMentorError extends Error {
	code = StatusCodes.CONFLICT
	message: string

	constructor(message = 'Работа уже назначена этому куратору.') {
		super()
		this.message = message
	}
}
