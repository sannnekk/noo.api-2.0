import { StatusCodes } from 'http-status-codes';
export class NotFoundError extends Error {
    code = StatusCodes.NOT_FOUND;
    message;
    constructor(message = 'The requested resource was not found') {
        super();
        this.message = message;
    }
}
