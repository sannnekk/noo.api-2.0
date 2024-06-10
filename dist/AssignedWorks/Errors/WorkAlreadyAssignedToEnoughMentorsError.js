import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class WorkAlreadyAssignedToEnoughMentorsError extends AppError {
    constructor(message = 'Работа уже назначена достаточному количеству кураторов.') {
        super(message);
        this.code = StatusCodes.CONFLICT;
    }
}
