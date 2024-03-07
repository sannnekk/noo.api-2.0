import { StatusCodes } from 'http-status-codes';
export class UnauthenticatedError extends Error {
    code = StatusCodes.UNAUTHORIZED;
    message;
    constructor(message = 'Вы не авторизованы.') {
        super();
        this.message = message;
    }
}
