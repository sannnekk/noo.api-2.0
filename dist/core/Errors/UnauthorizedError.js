import { StatusCodes } from 'http-status-codes';
export class UnauthorizedError extends Error {
    code = StatusCodes.FORBIDDEN;
    message;
    constructor(message = 'You are not authorized to perform this action') {
        super();
        this.message = message;
    }
}
