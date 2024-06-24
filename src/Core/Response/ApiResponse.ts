import { ControllerResponse } from 'express-controller-decorator'
import { StatusCodes } from 'http-status-codes'
import { InternalError } from '../Errors/InternalError'
import type { RequestMeta } from './RequestMeta'
import { AppError } from '../Errors/AppError'
import log from '../Logs/Logger'

export interface Response {
  data: object | object[] | null
  meta?: RequestMeta | null
  error?: string
}

export class ApiResponse extends ControllerResponse {
  /*
   * constructor
   */
  constructor(body?: null | undefined | Response | Error) {
    super()

    this.init(body)
  }

  /*
   * init
   */
  private init(payload: null | undefined | Response | Error) {
    if (payload === null || payload === undefined) {
      this.status = StatusCodes.NO_CONTENT
      this.body = undefined

      return
    }

    if (payload instanceof Error) {
      if (!(payload instanceof AppError)) {
        this.status = 500
        this.body = {
          error: 'Системная ошибка. Пожалуйста, сообщите об этом в поддержку',
        }

        log('error', JSON.stringify(payload))

        return
      }

      const { status, message } = this.getErrorData(payload)
      this.status = status
      this.body = { error: message }

      return
    }

    if ('data' in payload) {
      this.status = StatusCodes.OK
      this.body = {
        data: payload.data,
        meta: payload?.meta || null,
      }

      return
    }

    throw new InternalError('Invalid response')
  }

  private getErrorData(error: Error) {
    let status = StatusCodes.INTERNAL_SERVER_ERROR
    let message = 'Internal Server Error'

    if ('code' in error && typeof error.code === 'number') {
      status = error.code
    }

    if ('message' in error) {
      if (typeof error.message === 'string') {
        message = error.message
      } else if (typeof error.message === 'undefined') {
        message = 'Internal Server Error'
      } else if (typeof error.message === 'object') {
        message = JSON.stringify(error.message)
      }
    }

    return {
      status,
      message,
    }
  }
}
