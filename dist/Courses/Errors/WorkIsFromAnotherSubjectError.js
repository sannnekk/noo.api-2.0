import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class WorkIsFromAnotherSubjectError extends AppError {
    constructor() {
        super('Эта работа относится к другому предмету', StatusCodes.BAD_REQUEST);
    }
}
