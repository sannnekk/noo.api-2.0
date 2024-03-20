import { StatusCodes } from 'http-status-codes';
export class NotFoundError extends Error {
    code = StatusCodes.NOT_FOUND;
    message;
    constructor(message = 'Запрашиваемый ресурс не найден.') {
        super();
        this.message = message;
    }
}
