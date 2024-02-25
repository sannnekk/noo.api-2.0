import HttpStatusCode from 'express-controller-decorator/lib/decorators/HTTPStatusCodes';
export class InternalError extends Error {
    code = HttpStatusCode.INTERNAL_SERVER_ERROR;
    message;
    constructor(message = 'Internal Server Error') {
        super();
        this.message = message;
    }
}
