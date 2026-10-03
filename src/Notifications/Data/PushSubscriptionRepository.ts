import { Repository } from '@modules/Core/Data/Repository'
import { User } from '@modules/Users/Data/User'
import { PushSubscriptionModel } from './PushSubscriptionModel'
import { PushSubscription } from './PushSubscription'

export class PushSubscriptionRepository extends Repository<PushSubscription> {
  public constructor() {
    super(PushSubscriptionModel)
  }

  public async findByUserIds(
    userIds: User['id'][]
  ): Promise<PushSubscription[]> {
    if (!userIds.length) {
      return []
    }

    return this.queryBuilder('push_subscription')
      .where('push_subscription.userId IN (:...userIds)', { userIds })
      .getMany()
  }

  public async findByEndpoint(
    endpoint: string
  ): Promise<PushSubscription | null> {
    return this.queryBuilder('push_subscription')
      .where('push_subscription.endpoint = :endpoint', { endpoint })
      .getOne()
  }

  public async reassign(
    id: PushSubscription['id'],
    userId: User['id'],
    data: Pick<PushSubscription, 'p256dh' | 'auth' | 'userAgent'>
  ): Promise<void> {
    await this.queryBuilder()
      .update(PushSubscriptionModel)
      .set({ ...data, user: { id: userId } as User })
      .where('id = :id', { id })
      .execute()
  }

  public async deleteByEndpoint(
    endpoint: string,
    userId?: User['id']
  ): Promise<void> {
    const query = this.queryBuilder()
      .delete()
      .from(PushSubscriptionModel)
      .where('endpoint = :endpoint', { endpoint })

    if (userId) {
      query.andWhere('userId = :userId', { userId })
    }

    await query.execute()
  }
}
