import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError.js';
export class InternalError extends AppError {
    constructor(message = 'Внутренняя ошибка сервера.') {
        super(message);
        this.code = StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
