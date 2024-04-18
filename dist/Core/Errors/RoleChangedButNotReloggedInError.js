import { StatusCodes } from 'http-status-codes';
export class RoleChangedButNotReloggedInError extends Error {
    code = StatusCodes.CONFLICT;
    message;
    constructor(message = 'Похоже, у этого аккаунта изменилась роль. Пожалуйста, перезайдите.') {
        super();
        this.message = message;
    }
}
