import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'

export class CantChangeRoleError extends AppError {
  public constructor(
    message = 'Нельзя изменить роль пользователя, если он не является учеником'
  ) {
    super(message, StatusCodes.BAD_REQUEST)
  }
}
