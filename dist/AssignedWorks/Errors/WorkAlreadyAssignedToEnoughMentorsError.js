import { StatusCodes } from 'http-status-codes';
export class WorkAlreadyAssignedToEnoughMentorsError extends Error {
    code = StatusCodes.CONFLICT;
    message;
    constructor(message = 'Работа уже назначена достаточному количеству кураторов.') {
        super();
        this.message = message;
    }
}
