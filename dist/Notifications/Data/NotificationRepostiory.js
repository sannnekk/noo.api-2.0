import { Repository } from '../../Core/Data/Repository.js';
import { NotificationModel } from './NotificationModel.js';
export class NotificationRepository extends Repository {
    constructor() {
        super(NotificationModel);
    }
    async countUnread(userId) {
        return this.queryBuilder('notification')
            .where('notification.userId = :userId', { userId })
            .andWhere('notification.status = :status', { status: 'unread' })
            .getCount();
    }
    async markAsRead(id, userId) {
        await this.queryBuilder('notification')
            .update(NotificationModel)
            .set({ status: 'read' })
            .where('notification.id = :id', { id })
            .andWhere('notification.userId = :userId', { userId })
            .execute();
    }
    async markAllAsRead(userId) {
        await this.queryBuilder('notification')
            .update(NotificationModel)
            .set({ status: 'read' })
            .where('notification.userId = :userId', { userId })
            .execute();
    }
    async addUserRelation(notifications) {
        const users = await this.queryBuilder()
            .relation(NotificationModel, 'user')
            .of(notifications)
            .loadMany();
        const userMap = new Map(users.map((user) => [user.id, user]));
        for (const notification of notifications) {
            notification.user = userMap.get(notification.user.id);
        }
    }
}
