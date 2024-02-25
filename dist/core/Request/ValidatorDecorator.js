import { Catch } from '../Decorators/CatchDecorator.js';
import { InvalidRequestError } from '../Errors/InvalidRequestError.js';
export const ErrorConverter = () => Catch(Error, (error) => {
    throw new InvalidRequestError(error.message);
});
