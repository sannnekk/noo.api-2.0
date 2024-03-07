import { StatusCodes } from 'http-status-codes'

export class WorkIsArchived extends Error {
	code = StatusCodes.BAD_REQUEST
	message: string

	constructor(
		message = 'Работа архивирована и не может быть изменена.'
	) {
		super()
		this.message = message
	}
}
