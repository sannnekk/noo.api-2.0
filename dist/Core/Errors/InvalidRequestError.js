import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError.js';
export class InvalidRequestError extends AppError {
    constructor(message = 'Неверный запрос.') {
        super(message);
        this.code = StatusCodes.BAD_REQUEST;
    }
}
