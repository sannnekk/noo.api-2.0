import { ZodError } from 'zod';
import { Catch } from '../Decorators/CatchDecorator.js';
import { InvalidRequestError } from '../Errors/InvalidRequestError.js';
export const ErrorConverter = () => Catch(ZodError, (error) => {
    throw new InvalidRequestError(error.issues.map((issue) => issue.message).join(', '));
});
