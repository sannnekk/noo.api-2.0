export class UnknownError extends Error {
	code = 500
	message: string

	constructor(message = 'Произошла неизвестная ошибка.') {
		super()
		this.message = message
	}
}
