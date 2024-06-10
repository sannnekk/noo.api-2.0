import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class WorkAlreadyCheckedError extends AppError {
  constructor(message = 'Работа уже проверена.') {
    super(message)
    this.code = StatusCodes.CONFLICT
  }
}
