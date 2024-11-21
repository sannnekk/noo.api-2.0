import { ZodError, ZodIssue } from 'zod'
import { Catch } from '../Decorators/CatchDecorator'
import { InvalidRequestError } from '../Errors/InvalidRequestError'

/**
 * Return a string with error messages in the following format:
 * x<count of message1> - message1
 * x<count of message2> - message2
 * ...
 */
function stringifyZodErrors(issues: ZodIssue[]): string {
  const messages = issues.map((issue) => issue.message)
  const uniqueMessages = Array.from(new Set(messages))

  const messageCounts = uniqueMessages.map((message) => {
    const count = messages.filter((msg) => msg === message).length
    return `[x${count}] - ${message}`
  })

  return messageCounts.join(', ')
}

export const ErrorConverter = () =>
  Catch(ZodError, (error: Error) => {
    throw new InvalidRequestError(stringifyZodErrors((<ZodError>error).issues))
  })
