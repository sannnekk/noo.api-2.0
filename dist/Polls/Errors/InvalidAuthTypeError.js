import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class InvalidAuthTypeError extends AppError {
    code = StatusCodes.BAD_REQUEST;
    constructor(message = 'Этот тип авторизации не поддерживается') {
        super(message);
    }
}
