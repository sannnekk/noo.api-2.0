import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class AlreadyVotedError extends AppError {
    constructor(message = 'Вы уже голосовали в этом опросе') {
        super(message);
        this.code = StatusCodes.CONFLICT;
    }
}
