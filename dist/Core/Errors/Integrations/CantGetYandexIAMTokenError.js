import { StatusCodes } from 'http-status-codes';
import { AppError } from '../AppError.js';
export class CantGetYandexIAMTokenError extends AppError {
    constructor(message = 'Не удалось получить токен от Yandex.') {
        super(message);
        this.code = StatusCodes.SERVICE_UNAVAILABLE;
    }
}
