import { Repository } from '../../Core/Data/Repository.js';
import { SessionModel } from './SessionModel.js';
import { SessionOptions } from '../SessionsOptions.js';
export class SessionRepository extends Repository {
    constructor() {
        super(SessionModel);
    }
    async countOnlineUsers() {
        return this.queryBuilder()
            .distinctOn(['userId'])
            .where('last_request_at >= :datetime', {
            datetime: new Date(Date.now() - SessionOptions.onlineThreshold).toISOString(),
        })
            .getCount();
    }
}
