import { Repository } from '../../Core/Data/Repository.js';
import { SessionModel } from './SessionModel.js';
import { SessionOptions } from '../SessionsOptions.js';
import Dates from '../../Core/Utils/date.js';
export class SessionRepository extends Repository {
    constructor() {
        super(SessionModel);
    }
    async countOnlineUsers(condition) {
        const query = this.queryBuilder()
            .select('COUNT(userId)', 'count')
            .where('last_request_at >= :datetime', {
            datetime: Dates.format(new Date(Date.now() - SessionOptions.onlineThreshold), 'YYYY-MM-DD HH:mm:ss'),
        });
        if (condition) {
            query.setFindOptions({
                where: condition,
            });
        }
        const count = await query.getRawOne();
        return parseInt(count.count, 10);
    }
    async countActiveUsers(condition) {
        const query = this.queryBuilder()
            .select('COUNT(DISTINCT userId)', 'count')
            .where('last_request_at >= :datetime', {
            datetime: Dates.format(new Date(Date.now() - SessionOptions.activeThreshold), 'YYYY-MM-DD HH:mm:ss'),
        });
        if (condition) {
            query.setFindOptions({
                where: condition,
            });
        }
        const count = await query.getRawOne();
        return parseInt(count.count, 10);
    }
    async findLast(userId) {
        return this.queryBuilder()
            .where('userId = :userId', { userId })
            .orderBy('last_request_at', 'DESC')
            .getOne();
    }
}
