import { StatusCodes } from 'http-status-codes';
export class WrongRoleError extends Error {
    code = StatusCodes.FORBIDDEN;
    message;
    constructor(message = 'У вас недостаточно прав для выполнения этого действия.') {
        super();
        this.message = message;
    }
}
