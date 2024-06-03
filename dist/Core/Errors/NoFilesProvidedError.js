import { StatusCodes } from 'http-status-codes';
export class NoFilesProvidedError extends Error {
    code = StatusCodes.NOT_FOUND;
    message;
    constructor(message = 'Запрос не содержит файлов') {
        super();
        this.message = message;
    }
}
