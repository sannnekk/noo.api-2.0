import { z } from 'zod'

export const PushSubscriptionScheme = z.object({
  endpoint: z.string().url().max(512),
  keys: z.object({
    p256dh: z.string().min(1).max(255),
    auth: z.string().min(1).max(255),
  }),
})

export const PushUnsubscriptionScheme = z.object({
  endpoint: z.string().max(512),
})
