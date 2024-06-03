import { StatusCodes } from 'http-status-codes'

export class NoFilesProvidedError extends Error {
	readonly code: number = StatusCodes.NOT_FOUND
	message: string

	constructor(message = 'Запрос не содержит файлов') {
		super()
		this.message = message
	}
}
