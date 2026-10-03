import { Repository } from '../../Core/Data/Repository.js';
import { PushSubscriptionModel } from './PushSubscriptionModel.js';
export class PushSubscriptionRepository extends Repository {
    constructor() {
        super(PushSubscriptionModel);
    }
    async findByUserIds(userIds) {
        if (!userIds.length) {
            return [];
        }
        return this.queryBuilder('push_subscription')
            .where('push_subscription.userId IN (:...userIds)', { userIds })
            .getMany();
    }
    async findByEndpoint(endpoint) {
        return this.queryBuilder('push_subscription')
            .where('push_subscription.endpoint = :endpoint', { endpoint })
            .getOne();
    }
    async reassign(id, userId, data) {
        await this.queryBuilder()
            .update(PushSubscriptionModel)
            .set({ ...data, user: { id: userId } })
            .where('id = :id', { id })
            .execute();
    }
    async deleteByEndpoint(endpoint, userId) {
        const query = this.queryBuilder()
            .delete()
            .from(PushSubscriptionModel)
            .where('endpoint = :endpoint', { endpoint });
        if (userId) {
            query.andWhere('userId = :userId', { userId });
        }
        await query.execute();
    }
}
