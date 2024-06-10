import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class PollAlreadyEndedError extends AppError {
  public constructor(message = 'Опрос уже завершен') {
    super(message)
    this.code = StatusCodes.CONFLICT
  }
}
