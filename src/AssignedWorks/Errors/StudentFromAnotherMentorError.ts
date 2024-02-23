import { StatusCodes } from 'http-status-codes'

export class StudentFromAnotherMentorError extends Error {
	code = StatusCodes.BAD_REQUEST
	message: string

	constructor(message = 'The student is from another mentor') {
		super()
		this.message = message
	}
}
