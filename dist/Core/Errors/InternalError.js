import { StatusCodes } from 'http-status-codes';
export class InternalError extends Error {
    code = StatusCodes.INTERNAL_SERVER_ERROR;
    message;
    constructor(message = 'Внутренняя ошибка сервера.') {
        super();
        this.message = message;
    }
}
