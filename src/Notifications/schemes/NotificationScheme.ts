import { z } from 'zod'
import { NotificationTypeScheme } from './NotificationTypeScheme'

export const NotificationScheme = z.object({
  title: z.string(),
  message: z.string().nullable(),
  link: z.string().nullable(),
  type: NotificationTypeScheme,
  isBanner: z.boolean().default(false),
})
