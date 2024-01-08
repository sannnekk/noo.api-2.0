import { StatusCodes } from 'http-status-codes';
export class WorkAlreadyAssignedToThisMentorError extends Error {
    code = StatusCodes.CONFLICT;
    constructor() {
        super();
    }
}
