import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class CantVoteInPollError extends AppError {
  public constructor(message = 'Вы не можете участвовать в этом опросе') {
    super(message)
    this.code = StatusCodes.FORBIDDEN
  }
}
