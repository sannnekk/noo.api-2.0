import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class CantDeleteMadeWorkError extends AppError {
    constructor(message = 'Нельзя удалить выполненную работу.') {
        super(message, StatusCodes.BAD_REQUEST);
    }
}
