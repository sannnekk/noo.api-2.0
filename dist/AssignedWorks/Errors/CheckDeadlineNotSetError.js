import { StatusCodes } from 'http-status-codes';
export class CheckDeadlineNotSetError extends Error {
    code = StatusCodes.BAD_REQUEST;
    message;
    constructor(message = 'The check deadline for this assigned work is not set') {
        super();
        this.message = message;
    }
}
