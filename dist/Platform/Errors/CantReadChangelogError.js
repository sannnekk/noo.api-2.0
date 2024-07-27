import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class CantReadChangelogError extends AppError {
    constructor() {
        super('Не удалось прочитать файл Changelog', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
