import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class WorkAlreadySolvedError extends AppError {
    constructor(message = 'Работа уже выполнена.') {
        super(message);
        this.code = StatusCodes.CONFLICT;
    }
}
