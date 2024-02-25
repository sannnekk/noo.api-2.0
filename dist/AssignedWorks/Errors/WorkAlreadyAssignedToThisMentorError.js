import { StatusCodes } from 'http-status-codes';
export class WorkAlreadyAssignedToThisMentorError extends Error {
    code = StatusCodes.CONFLICT;
    message;
    constructor(message = 'The work has already been assigned to this mentor') {
        super();
        this.message = message;
    }
}
