import { StatusCodes } from 'http-status-codes'
import { AppError } from './AppError'

export class WrongRoleError extends AppError {
  constructor(
    message = 'У вас недостаточно прав для выполнения этого действия.'
  ) {
    super(message)
    this.code = StatusCodes.FORBIDDEN
  }
}
