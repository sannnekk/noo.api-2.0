import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class PollAlreadyEndedError extends AppError {
    constructor(message = 'Опрос уже завершен') {
        super(message);
        this.code = StatusCodes.CONFLICT;
    }
}
