import { AppError } from '../../Core/Errors/AppError.js';
export class InvalidTelegramHashError extends AppError {
    constructor(message = 'Верификация невозможна. Попробуйте еще раз или обратитесь в поддержку') {
        super(message, 400);
    }
}
