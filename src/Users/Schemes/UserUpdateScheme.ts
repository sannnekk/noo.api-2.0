//import { PasswordScheme } from '@modules/Auth/Schemes/PasswordScheme'
import { z } from 'zod'
import { UserAvatarScheme } from './UserAvatarScheme'

export const UserUpdateScheme = z.object({
  id: z.string().ulid(),
  name: z.string().optional(),
  avatar: UserAvatarScheme.optional().nullable(),
  forbidden: z.number().optional(),
  telegramNotificationsEnabled: z.boolean().optional(),
})
