import { StatusCodes } from 'http-status-codes';
export class StudentFromAnotherMentorError extends Error {
    code = StatusCodes.BAD_REQUEST;
    constructor() {
        super();
    }
}
