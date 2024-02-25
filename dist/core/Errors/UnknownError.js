export class UnknownError extends Error {
    code = 500;
    message;
    constructor(message = 'An unknown server error occurred') {
        super();
        this.message = message;
    }
}
