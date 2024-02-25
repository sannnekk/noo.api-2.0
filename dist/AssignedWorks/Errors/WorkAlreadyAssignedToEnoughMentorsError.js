import { StatusCodes } from 'http-status-codes';
export class WorkAlreadyAssignedToEnoughMentorsError extends Error {
    code = StatusCodes.CONFLICT;
    message;
    constructor(message = 'The work has already been assigned to enough mentors') {
        super();
        this.message = message;
    }
}
