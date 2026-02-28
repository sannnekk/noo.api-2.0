import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class CantDeleteMadeWorkError extends AppError {
  public constructor(message = 'Нельзя удалить выполненную работу.') {
    super(message, StatusCodes.BAD_REQUEST)
  }
}
