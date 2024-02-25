import { StatusCodes } from 'http-status-codes';
export class InternalError extends Error {
    code = StatusCodes.INTERNAL_SERVER_ERROR;
    message;
    constructor(message = 'Internal Server Error') {
        super();
        this.message = message;
    }
}
