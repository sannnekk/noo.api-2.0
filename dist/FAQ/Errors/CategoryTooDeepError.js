import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
import { FAQOptions } from '../FAQOptions.js';
export class CategoryTooDeepError extends AppError {
    constructor() {
        super('Категория слишком глубоко вложена, максимальная вложенность: ' +
            FAQOptions.maxCategoryDepth, StatusCodes.BAD_REQUEST);
    }
}
