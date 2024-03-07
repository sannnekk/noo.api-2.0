import { StatusCodes } from 'http-status-codes';
export class StudentFromAnotherMentorError extends Error {
    code = StatusCodes.BAD_REQUEST;
    message;
    constructor(message = 'Ученик принадлежит другому куратору.') {
        super();
        this.message = message;
    }
}
