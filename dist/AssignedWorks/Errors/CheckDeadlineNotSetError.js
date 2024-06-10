import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class CheckDeadlineNotSetError extends AppError {
    constructor(message = 'Дедлайн проверки задания не установлен.') {
        super(message);
        this.code = StatusCodes.BAD_REQUEST;
    }
}
