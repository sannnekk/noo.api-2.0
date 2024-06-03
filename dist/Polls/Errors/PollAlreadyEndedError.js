import { StatusCodes } from 'http-status-codes';
export class PollAlreadyEndedError extends Error {
    code = StatusCodes.GONE;
    message;
    constructor(message = 'Опрос уже завершен') {
        super();
        this.message = message;
    }
}
