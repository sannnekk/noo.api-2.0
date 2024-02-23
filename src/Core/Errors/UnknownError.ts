export class UnknownError extends Error {
	code = 500
	message: string

	constructor(message = 'An unknown server error occurred') {
		super()
		this.message = message
	}
}
