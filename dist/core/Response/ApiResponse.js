import { ControllerResponse } from 'express-controller-decorator';
import { StatusCodes } from 'http-status-codes';
import { InternalError } from '../Errors/InternalError.js';
import { AppError } from '../Errors/AppError.js';
import { log } from '../Logs/Logger.js';
export class ApiResponse extends ControllerResponse {
    /*
     * constructor
     *
     * @param {null | undefined | Response | Error} body - response body
     * @param {Context | undefined} context - request context (only useable for error reposrting)
     */
    constructor(body, context) {
        super();
        this.init(body, context);
    }
    /*
     * init
     */
    init(payload, context) {
        if (payload === null || payload === undefined) {
            this.status = StatusCodes.NO_CONTENT;
            this.body = undefined;
            return;
        }
        if (payload instanceof Error) {
            if (!(payload instanceof AppError)) {
                const errorId = Math.random().toString(36).substring(7).toUpperCase();
                this.status = 500;
                this.body = {
                    error: 'Системная ошибка. Пожалуйста, сообщите об этом в поддержку. Передайте в поддержку следующий идентификатор ошибки: ' +
                        errorId,
                };
                return log('error', errorId, payload, context);
            }
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
