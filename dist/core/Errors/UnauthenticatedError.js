import { StatusCodes } from 'http-status-codes';
export class UnauthenticatedError extends Error {
    code = StatusCodes.UNAUTHORIZED;
    message;
    constructor(message = 'You are not authenticated') {
        super();
        this.message = message;
    }
}
