import { StatusCodes } from 'http-status-codes'

export function getErrorData(error: Error) {
	let status = StatusCodes.INTERNAL_SERVER_ERROR
	let message = 'Internal Server Error'

	if ('code' in error && typeof error.code === 'number') {
		status = error.code
	}

	if ('message' in error) {
		if (typeof error.message === 'string') {
			message = error.message
		} else if (typeof error.message === 'undefined') {
			message = 'Internal Server Error'
		} else if (typeof error.message === 'object') {
			message = JSON.stringify(error.message)
		}
	}

	return {
		status,
		message,
	}
}
