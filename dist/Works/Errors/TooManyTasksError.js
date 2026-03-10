import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class TooManyTasksError extends AppError {
    constructor(message = 'У работы слишком много заданий') {
        super(message);
        this.code = StatusCodes.BAD_REQUEST;
    }
}
