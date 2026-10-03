import { PushSubscriptionRepository } from '../Data/PushSubscriptionRepository.js';
export class PushSubscriptionService {
    subscriptionRepository;
    constructor() {
        this.subscriptionRepository = new PushSubscriptionRepository();
    }
    getPublicKey() {
        return process.env.VAPID_PUBLIC_KEY || null;
    }
    async subscribe(userId, subscription, userAgent) {
        const data = {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            userAgent: userAgent?.slice(0, 255) || null,
        };
        const existing = await this.subscriptionRepository.findByEndpoint(subscription.endpoint);
        // the same browser may be reused by another account
        if (existing) {
            await this.subscriptionRepository.reassign(existing.id, userId, data);
            return;
        }
        await this.subscriptionRepository.create({
            ...data,
            endpoint: subscription.endpoint,
            user: { id: userId },
        });
    }
    async unsubscribe(userId, unsubscription) {
        await this.subscriptionRepository.deleteByEndpoint(unsubscription.endpoint, userId);
    }
}
