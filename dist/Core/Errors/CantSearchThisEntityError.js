import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError.js';
export class CantSearchThisEntityError extends AppError {
    constructor(message = 'Невозможно выполнить поиск по этой сущности.') {
        super(message);
        this.code = StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
