import { StatusCodes } from 'http-status-codes'
import { AppError } from './AppError'

export class EmailSendFailedError extends AppError {
  constructor(error: Error) {
    super(
      'Не удалось отправить письмо на почту. Причина (для техподдержки): ' +
        error.message
    )
    this.code = StatusCodes.INTERNAL_SERVER_ERROR
  }
}
