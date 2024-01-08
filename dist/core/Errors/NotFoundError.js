import { StatusCodes } from 'http-status-codes';
export class NotFoundError extends Error {
    code = StatusCodes.NOT_FOUND;
    constructor() {
        super();
        this.name = 'NotFoundError';
    }
}
