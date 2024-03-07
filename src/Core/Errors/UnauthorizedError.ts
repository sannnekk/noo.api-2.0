import { StatusCodes } from 'http-status-codes'

export class UnauthorizedError extends Error {
	code = StatusCodes.FORBIDDEN
	message: string

	constructor(
		message = 'У вас недостаточно прав для выполнения этого действия.'
	) {
		super()
		this.message = message
	}
}
