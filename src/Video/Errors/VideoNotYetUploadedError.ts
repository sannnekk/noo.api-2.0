import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class VideoNotYetUploadedError extends AppError {
  constructor(
    message = 'Видео еще не загружено, подождите полной загрузки и повторите попытку'
  ) {
    super(message)
    this.code = StatusCodes.BAD_REQUEST
  }
}
