import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class VideoAlreadyUploadedError extends AppError {
  constructor(message = 'Видео уже загружено') {
    super(message)
    this.code = StatusCodes.BAD_REQUEST
  }
}
