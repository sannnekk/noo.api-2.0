import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError.js';
export class NoFilesProvidedError extends AppError {
    constructor(message = 'Запрос не содержит файлов') {
        super(message);
        this.code = StatusCodes.BAD_REQUEST;
    }
}
