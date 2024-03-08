import { StatusCodes } from 'http-status-codes';
export class InvalidVerificationTokenError extends Error {
    code = StatusCodes.BAD_REQUEST;
    message;
    constructor(message = 'Ссылка для подтверждения аккаунта недействительна') {
        super();
        this.message = message;
    }
}
