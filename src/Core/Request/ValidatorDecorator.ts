import { ZodError } from 'zod'
import { Catch } from '../Decorators/CatchDecorator'
import { InvalidRequestError } from '../Errors/InvalidRequestError'

export const ErrorConverter = () =>
  Catch(ZodError, (error: Error) => {
    throw new InvalidRequestError(
      (<ZodError>error).issues.map((issue) => issue.message).join(', ')
    )
  })
