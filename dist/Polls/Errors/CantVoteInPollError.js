import { StatusCodes } from 'http-status-codes';
export class CantVoteInPollError extends Error {
    code = StatusCodes.FORBIDDEN;
    message;
    constructor(message = 'Вы не можете участвовать в этом опросе') {
        super();
        this.message = message;
    }
}
