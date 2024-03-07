import { StatusCodes } from 'http-status-codes';
export class WorkIsNotSolvedYetError extends Error {
    code = StatusCodes.CONFLICT;
    message;
    constructor(message = 'Работа еще не выполнена.') {
        super();
        this.message = message;
    }
}
