import { StatusCodes } from 'http-status-codes';
export class WorkAlreadyAssignedToEnoughMentorsError extends Error {
    code = StatusCodes.CONFLICT;
    constructor() {
        super();
    }
}
