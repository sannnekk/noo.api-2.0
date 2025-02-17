import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'
import { VideoOptions } from '../VideoOptions'

export class TooManyCommentsError extends AppError {
  constructor(
    message = `Вы не можете оставить больше ${VideoOptions.maxCommentsPerVideo} комментариев под одним видео`
  ) {
    super(message)
    this.code = StatusCodes.INTERNAL_SERVER_ERROR
  }
}
