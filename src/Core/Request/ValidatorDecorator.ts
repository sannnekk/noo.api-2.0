import { Catch } from '../Decorators/CatchDecorator'
import { InvalidRequestError } from '../Errors/InvalidRequestError'

export const ErrorConverter = () =>
	Catch(Error, (error) => {
		throw new InvalidRequestError(error.message)
	})
