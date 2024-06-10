import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class DeadlineAlreadyShiftedError extends AppError {
    constructor(message = 'Дедлайн уже был сдвинут.') {
        super(message);
        this.code = StatusCodes.CONFLICT;
    }
}
