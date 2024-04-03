import { InvalidRequestError } from '../Core/Errors/InvalidRequestError.js';
import { Validator } from '../Core/Request/Validator.js';
export class StatisticsValidator extends Validator {
    validateGetStatistics(body) {
        if (!body.from || !body.to) {
            throw new InvalidRequestError('Даты не указаны');
        }
        if (new Date(body.from) > new Date(body.to)) {
            throw new InvalidRequestError('Дата начала больше даты окончания');
        }
        if (new Date(body.to).getTime() - new Date(body.from).getTime() >
            1000 * 60 * 60 * 24 * 90) {
            throw new InvalidRequestError('Период не должен превышать 90 дней');
        }
        if ('type' in body) {
            const types = [
                'trial-work',
                'phrase',
                'mini-test',
                'test',
                'second-part',
            ];
            if (!types.includes(body.type)) {
                throw new InvalidRequestError('Неверный тип работы');
            }
        }
    }
}
