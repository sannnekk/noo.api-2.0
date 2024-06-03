import { StatusCodes } from 'http-status-codes';
export class AlreadyVotedError extends Error {
    code = StatusCodes.CONFLICT;
    constructor(message = 'Вы уже голосовали в этом опросе') {
        super(message);
    }
}
