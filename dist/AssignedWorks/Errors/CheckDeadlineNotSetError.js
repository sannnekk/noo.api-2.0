import { StatusCodes } from 'http-status-codes';
export class CheckDeadlineNotSetError extends Error {
    code = StatusCodes.BAD_REQUEST;
    message;
    constructor(message = 'Дедлайн проверки задания не установлен.') {
        super();
        this.message = message;
    }
}
