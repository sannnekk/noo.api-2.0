import { StatusCodes } from 'http-status-codes'
import { AppError } from './AppError'

export class RoleChangedButNotReloggedInError extends AppError {
  constructor(
    message = 'Похоже, у этого аккаунта изменилась роль. Пожалуйста, перезайдите.'
  ) {
    super(message)
    this.code = StatusCodes.FORBIDDEN
  }
}
