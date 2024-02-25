import { StatusCodes } from 'http-status-codes';
export class InvalidRequestError extends Error {
    code = StatusCodes.BAD_REQUEST;
    message;
    constructor(message = 'Invalid request data') {
        super(message);
        this.message = message;
    }
}
