import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class CantVoteInPollError extends AppError {
    constructor(message = 'Вы не можете участвовать в этом опросе') {
        super(message);
        this.code = StatusCodes.FORBIDDEN;
    }
}
