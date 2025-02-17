import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class FailedToDeleteYandexVideoError extends AppError {
    constructor(message = 'Не удалось удалить видео из Yandex. Обратитесь в поддержку.') {
        super(message);
        this.code = StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
