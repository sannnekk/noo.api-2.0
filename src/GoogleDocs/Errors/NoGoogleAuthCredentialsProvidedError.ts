import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class NoGoogleAuthCredentialsProvidedError extends AppError {
  constructor() {
    super('Не предоставлены данные для входа в Google', StatusCodes.BAD_REQUEST)
  }
}
