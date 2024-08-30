import { z } from 'zod'
import { NotificationScheme } from './NotificationScheme'
import { NotificationSendOptionsScheme } from './NotificationSendOptionsScheme'

export const CreateNotificationScheme = z.object({
  notification: NotificationScheme,
  sendOptions: NotificationSendOptionsScheme,
})
