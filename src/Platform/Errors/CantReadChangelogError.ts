import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class CantReadChangelogError extends AppError {
  public constructor() {
    super(
      'Не удалось прочитать файл Changelog',
      StatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}
