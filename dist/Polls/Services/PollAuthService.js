import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
export class PollAuthService {
    checkTelegramAuth(telegramAuthPayload) {
        if (!telegramAuthPayload) {
            throw new UnauthorizedError('Пользователь не аутентифицирован с помощью Telegram');
        }
        // TODO: Implement the check for the Telegram authentication payload
    }
}
