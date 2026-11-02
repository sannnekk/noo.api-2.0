import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class TaskCanNotBeCheckedByAiError extends AppError {
  constructor(message = 'Это задание не может быть проверено НОО.Шпунтиком.') {
    super(message)
    this.code = StatusCodes.BAD_REQUEST
  }
}
