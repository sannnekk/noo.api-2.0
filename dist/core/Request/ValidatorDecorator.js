import { ZodError } from 'zod';
import { Catch } from '../Decorators/CatchDecorator';
import { InvalidRequestError } from '../Errors/InvalidRequestError';
export const ErrorConverter = () => Catch(ZodError, (error) => {
    throw new InvalidRequestError(error.issues.map((issue) => issue.message).join(', '));
});
