import { AppError } from '../../Core/Errors/AppError.js';
import { StatusCodes } from 'http-status-codes';
export class CantChangeRoleError extends AppError {
    constructor(message = 'Нельзя изменить роль пользователя, если он не является учеником') {
        super(message, StatusCodes.BAD_REQUEST);
    }
}
