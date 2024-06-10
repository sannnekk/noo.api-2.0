import { StatusCodes } from 'http-status-codes'
import { AppError } from './AppError'

export class NotFoundError extends AppError {
  constructor(message = 'Запрашиваемый ресурс не найден.') {
    super(message)
    this.code = StatusCodes.NOT_FOUND
  }
}
