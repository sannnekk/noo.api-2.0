import webpush from 'web-push'
import { NotificationBus } from './NotificationBus'
import type { Notification } from '../../Data/Notification'
import type { PushSubscription } from '../../Data/PushSubscription'
import { PushSubscriptionRepository } from '../../Data/PushSubscriptionRepository'
import { log } from '@modules/Core/Logs/Logger'

const PUSH_TTL = 24 * 60 * 60

export class WebPushBus extends NotificationBus {
  private readonly isConfigured: boolean

  private readonly subscriptionRepository: PushSubscriptionRepository

  public constructor() {
    super()

    this.subscriptionRepository = new PushSubscriptionRepository()

    const publicKey = process.env.VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const subject = process.env.VAPID_SUBJECT

    this.isConfigured = !!(publicKey && privateKey && subject)

    if (this.isConfigured) {
      webpush.setVapidDetails(subject!, publicKey!, privateKey!)
    }
  }

  public async notify(notifications: Notification[]): Promise<void> {
    if (!this.isConfigured || !notifications.length) {
      return
    }

    try {
      const userIds = [
        ...new Set(notifications.map((notification) => notification.userId)),
      ]

      const subscriptions =
        await this.subscriptionRepository.findByUserIds(userIds)

      const subscriptionsByUser = new Map<string, PushSubscription[]>()

      for (const subscription of subscriptions) {
        const list = subscriptionsByUser.get(subscription.userId) ?? []
        list.push(subscription)
        subscriptionsByUser.set(subscription.userId, list)
      }

      const jobs = notifications.flatMap((notification) =>
        (subscriptionsByUser.get(notification.userId) ?? []).map(
          (subscription) => this.send(subscription, notification)
        )
      )

      await Promise.allSettled(jobs)
    } catch (error: any) {
      log('error', 'web-push', error?.message ?? String(error))
    }
  }

  private async send(
    subscription: PushSubscription,
    notification: Notification
  ): Promise<void> {
    const payload = JSON.stringify({
      id: notification.id,
      title: notification.title,
      body: notification.message,
      link: notification.link,
      type: notification.type,
    })

    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
        { TTL: PUSH_TTL, timeout: 5000 }
      )
    } catch (error: any) {
      // subscription is expired or revoked by the browser
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await this.subscriptionRepository.deleteByEndpoint(
          subscription.endpoint
        )
        return
      }

      log('error', 'web-push', error?.message ?? String(error))
    }
  }
}
