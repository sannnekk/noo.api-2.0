import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError.js';
export class AlreadyExistError extends AppError {
    constructor(message = 'Такой объект уже существует.') {
        super(message);
        this.code = StatusCodes.CONFLICT;
    }
}
