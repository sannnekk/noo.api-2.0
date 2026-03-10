import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class TooManyTasksError extends AppError {
  public constructor(message = 'У работы слишком много заданий') {
    super(message)
    this.code = StatusCodes.BAD_REQUEST
  }
}
