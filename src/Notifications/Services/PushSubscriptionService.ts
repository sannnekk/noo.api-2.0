import { User } from '@modules/Users/Data/User'
import { PushSubscriptionRepository } from '../Data/PushSubscriptionRepository'
import type {
  PushSubscriptionDTO,
  PushUnsubscriptionDTO,
} from '../PushSubscriptionValidator'

export class PushSubscriptionService {
  private readonly subscriptionRepository: PushSubscriptionRepository

  public constructor() {
    this.subscriptionRepository = new PushSubscriptionRepository()
  }

  public getPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY || null
  }

  public async subscribe(
    userId: User['id'],
    subscription: PushSubscriptionDTO,
    userAgent: string | null
  ): Promise<void> {
    const data = {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent?.slice(0, 255) || null,
    }

    const existing = await this.subscriptionRepository.findByEndpoint(
      subscription.endpoint
    )

    // the same browser may be reused by another account
    if (existing) {
      await this.subscriptionRepository.reassign(existing.id, userId, data)
      return
    }

    await this.subscriptionRepository.create({
      ...data,
      endpoint: subscription.endpoint,
      user: { id: userId } as User,
    } as any)
  }

  public async unsubscribe(
    userId: User['id'],
    unsubscription: PushUnsubscriptionDTO
  ): Promise<void> {
    await this.subscriptionRepository.deleteByEndpoint(
      unsubscription.endpoint,
      userId
    )
  }
}
