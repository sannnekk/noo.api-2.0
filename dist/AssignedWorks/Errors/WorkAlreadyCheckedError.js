import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class WorkAlreadyCheckedError extends AppError {
    constructor(message = 'Работа уже проверена.') {
        super(message);
        this.code = StatusCodes.CONFLICT;
    }
}
