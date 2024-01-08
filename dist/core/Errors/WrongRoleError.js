import { StatusCodes } from 'http-status-codes';
export class WrongRoleError extends Error {
    code = StatusCodes.FORBIDDEN;
    constructor() {
        super();
    }
}
