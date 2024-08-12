import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class CourseIsEmptyError extends AppError {
    constructor() {
        super('Курс пока пустой. Возможно, он еще не открылся для всех', StatusCodes.NOT_IMPLEMENTED);
    }
}
