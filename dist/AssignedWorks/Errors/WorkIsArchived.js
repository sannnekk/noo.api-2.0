import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class WorkIsArchived extends AppError {
    constructor(message = 'Работа архивирована и не может быть изменена.') {
        super(message);
        this.code = StatusCodes.CONFLICT;
    }
}
