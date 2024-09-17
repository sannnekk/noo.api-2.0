import { Repository } from '../../Core/Data/Repository.js';
import { SessionModel } from './SessionModel.js';
import { SessionOptions } from '../SessionsOptions.js';
export class SessionRepository extends Repository {
    constructor() {
        super(SessionModel);
    }
    async countOnlineUsers(condition) {
        const query = this.queryBuilder()
            .distinctOn(['userId'])
            .where('last_request_at >= :datetime', {
            datetime: new Date(Date.now() - SessionOptions.onlineThreshold).toISOString(),
        });
        if (condition) {
            query.setFindOptions({
                where: condition,
            });
        }
        return query.getCount();
    }
    async findLast(userId) {
        return this.queryBuilder()
            .where('userId = :userId', { userId })
            .orderBy('last_request_at', 'DESC')
            .getOne();
    }
}
