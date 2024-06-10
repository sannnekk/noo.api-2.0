import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class SolveDeadlineNotSetError extends AppError {
  constructor(message = 'Срок выполнения не установлен.') {
    super(message)
    this.code = StatusCodes.BAD_REQUEST
  }
}
