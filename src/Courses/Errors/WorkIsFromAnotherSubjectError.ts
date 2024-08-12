import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class WorkIsFromAnotherSubjectError extends AppError {
  public constructor() {
    super('Эта работа из другого предмета', StatusCodes.BAD_REQUEST)
  }
}
