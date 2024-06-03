import { StatusCodes } from 'http-status-codes'
export class RoleChangedButNotReloggedInError extends Error {
	code = StatusCodes.UNAUTHORIZED
	message
	constructor(
		message = 'Роль пользователя была изменена, но пользователь не перезашел в систему.'
	) {
		super()
		this.message = message
	}
}
