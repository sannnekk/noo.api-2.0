import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class FailedToDeleteKinescopeVideoError extends AppError {
    constructor(message = 'Не удалось удалить видео из Kinescope. Обратитесь в поддержку.') {
        super(message);
        this.code = StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
