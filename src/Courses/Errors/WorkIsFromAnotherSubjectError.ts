import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class WorkIsFromAnotherSubjectError extends AppError {
  public constructor() {
    super('Эта работа относится к другому предмету', StatusCodes.BAD_REQUEST)
  }
}
