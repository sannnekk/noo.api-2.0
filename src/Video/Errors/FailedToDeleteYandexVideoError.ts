import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class FailedToDeleteYandexVideoError extends AppError {
  constructor(message = 'Не удалось удалить видео из Yandex.') {
    super(message)
    this.code = StatusCodes.INTERNAL_SERVER_ERROR
  }
}
