import { StatusCodes } from 'http-status-codes'
import { AppError } from './AppError'

export class AlreadyExistError extends AppError {
  constructor(message = 'Такой объект уже существует.') {
    super(message)
    this.code = StatusCodes.CONFLICT
  }
}
