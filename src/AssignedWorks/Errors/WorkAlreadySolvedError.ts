import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class WorkAlreadySolvedError extends AppError {
  constructor(message = 'Работа уже выполнена.') {
    super(message)
    this.code = StatusCodes.CONFLICT
  }
}
