import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError.js';
export class UnauthenticatedError extends AppError {
    constructor(message = 'Вы не авторизованы.') {
        super(message);
        this.code = StatusCodes.UNAUTHORIZED;
    }
}
