import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class WorkAlreadyAssignedToThisMentorError extends AppError {
  constructor(message = 'Работа уже назначена этому куратору.') {
    super(message)
    this.code = StatusCodes.CONFLICT
  }
}
