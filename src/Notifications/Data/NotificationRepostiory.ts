import { Repository } from '@modules/Core/Data/Repository'
import { NotificationModel } from './NotificationModel'
import { Notification } from './Notification'
import { User } from '@modules/Users/Data/User'

export class NotificationRepository extends Repository<Notification> {
  public constructor() {
    super(NotificationModel)
  }

  public async countUnread(userId: User['id']): Promise<number> {
    return this.queryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.status = :status', { status: 'unread' })
      .getCount()
  }

  public async markAsRead(
    id: Notification['id'],
    userId: User['id']
  ): Promise<void> {
    await this.queryBuilder('notification')
      .update(NotificationModel)
      .set({ status: 'read' })
      .where('notification.id = :id', { id })
      .andWhere('notification.userId = :userId', { userId })
      .execute()
  }

  public async markAllAsRead(userId: User['id']): Promise<void> {
    await this.queryBuilder('notification')
      .update(NotificationModel)
      .set({ status: 'read' })
      .where('notification.userId = :userId', { userId })
      .execute()
  }

  public async addUserRelation(notifications: Notification[]): Promise<void> {
    const users = await this.queryBuilder()
      .relation(NotificationModel, 'user')
      .of(notifications)
      .loadMany<User>()

    const userMap = new Map(users.map((user) => [user.id, user]))

    for (const notification of notifications) {
      notification.user = userMap.get(notification.user.id)!
    }
  }
}
