import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class WorkIsFromAnotherSubjectError extends AppError {
    constructor() {
        super('Эта работа из другого предмета', StatusCodes.BAD_REQUEST);
    }
}
