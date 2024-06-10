import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class WorkIsNotSolvedYetError extends AppError {
  constructor(message = 'Работа еще не выполнена.') {
    super(message)
    this.code = StatusCodes.CONFLICT
  }
}
