import { StatusCodes } from 'http-status-codes'
import { AppError } from './AppError'

export class InternalError extends AppError {
  constructor(message: string = 'Внутренняя ошибка сервера.') {
    super(message)
    this.code = StatusCodes.INTERNAL_SERVER_ERROR
  }
}
