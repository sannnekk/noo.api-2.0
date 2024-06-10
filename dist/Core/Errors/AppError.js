import { StatusCodes } from 'http-status-codes';
export class AppError extends Error {
    code = StatusCodes.INTERNAL_SERVER_ERROR;
    constructor(message, code = 500) {
        super(message);
        this.code = code;
    }
}
