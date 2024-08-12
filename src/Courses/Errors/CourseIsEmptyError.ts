import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class CourseIsEmptyError extends AppError {
  public constructor() {
    super(
      'Курс пока пустой. Возможно, он еще не открылся для всех',
      StatusCodes.NOT_IMPLEMENTED
    )
  }
}
