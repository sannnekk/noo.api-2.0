import { StatusCodes } from 'http-status-codes'

export class AppError extends Error {
  public code: number = StatusCodes.INTERNAL_SERVER_ERROR

  constructor(message: string, code = 500) {
    super(message)
    this.code = code
  }
}
