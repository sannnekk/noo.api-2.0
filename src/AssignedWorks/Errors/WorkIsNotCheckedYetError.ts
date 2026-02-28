import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class WorkIsNotCheckedYetError extends AppError {
  constructor(message = 'Работа еще не проверена.') {
    super(message)
    this.code = StatusCodes.CONFLICT
  }
}
