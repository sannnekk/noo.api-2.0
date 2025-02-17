import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
import { VideoOptions } from '../VideoOptions.js';
export class TooManyCommentsError extends AppError {
    constructor(message = `Вы не можете оставить больше ${VideoOptions.maxCommentsPerVideo} комментариев под одним видео`) {
        super(message);
        this.code = StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
