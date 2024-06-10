import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class StudentFromAnotherMentorError extends AppError {
  constructor(message = 'Ученик принадлежит другому куратору.') {
    super(message)
    this.code = StatusCodes.FORBIDDEN
  }
}
