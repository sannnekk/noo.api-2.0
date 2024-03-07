import { StatusCodes } from 'http-status-codes';
export class WorkAlreadyCheckedError extends Error {
    code = StatusCodes.CONFLICT;
    message;
    constructor(message = 'Работа уже проверена.') {
        super();
        this.message = message;
    }
}
