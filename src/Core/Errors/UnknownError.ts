import { StatusCodes } from 'http-status-codes'
import { AppError } from './AppError'

export class UnknownError extends AppError {
  constructor(message = 'Произошла неизвестная ошибка.') {
    super(message)
    this.code = StatusCodes.INTERNAL_SERVER_ERROR
  }
}
