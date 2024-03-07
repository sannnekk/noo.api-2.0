export class UnknownError extends Error {
    code = 500;
    message;
    constructor(message = 'Произошла неизвестная ошибка.') {
        super();
        this.message = message;
    }
}
