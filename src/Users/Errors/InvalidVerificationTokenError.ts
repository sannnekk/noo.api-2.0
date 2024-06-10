import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class InvalidVerificationTokenError extends AppError {
  constructor(message = 'Ссылка для подтверждения аккаунта недействительна') {
    super(message)
    this.code = StatusCodes.BAD_REQUEST
  }
}
