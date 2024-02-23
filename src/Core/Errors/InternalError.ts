import HttpStatusCode from 'express-controller-decorator/lib/decorators/HTTPStatusCodes'

export class InternalError extends Error {
	public code = HttpStatusCode.INTERNAL_SERVER_ERROR
	public message

	constructor(message: string = 'Internal Server Error') {
		super()
		this.message = message
	}
}
