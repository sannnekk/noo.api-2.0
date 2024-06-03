import { ControllerResponse } from 'express-controller-decorator';
import { InternalError } from '../Errors/InternalError.js';
import { StatusCodes } from 'http-status-codes';
export class ApiResponse extends ControllerResponse {
    /*
     * constructor
     */
    constructor(body) {
        super();
        this.init(body);
    }
    /*
     * init
     */
    init(payload) {
        if (payload === null || payload === undefined) {
            this.status = StatusCodes.NO_CONTENT;
            this.body = undefined;
            return;
        }
        if (payload instanceof Error) {
            const { status, message } = this.getErrorData(payload);
            this.status = status;
            this.body = { error: message };
            return;
        }
        if ('data' in payload) {
            this.status = StatusCodes.OK;
            this.body = {
                data: payload.data,
                meta: payload?.meta || null,
            };
            return;
        }
        throw new InternalError('Invalid response');
    }
    getErrorData(error) {
        let status = StatusCodes.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        if ('code' in error && typeof error.code === 'number') {
            status = error.code;
        }
        if ('message' in error) {
            if (typeof error.message === 'string') {
                message = error.message;
            }
            else if (typeof error.message === 'undefined') {
                message = 'Internal Server Error';
            }
            else if (typeof error.message === 'object') {
                message = JSON.stringify(error.message);
            }
        }
        return {
            status,
            message,
        };
    }
}
