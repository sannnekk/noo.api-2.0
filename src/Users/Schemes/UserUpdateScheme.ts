import { PasswordScheme } from '@modules/Auth/Schemes/PasswordScheme'
import { UserRoleScheme } from '@modules/Core/Schemes/UserRoleScheme'
import { z } from 'zod'
import { UserAvatarScheme } from './UserAvatarScheme'

export const UserUpdateScheme = z.object({
  id: z.string().ulid(),
  name: z.string().optional(),
  password: PasswordScheme.optional(),
  avatar: UserAvatarScheme.optional().nullable(),
  role: UserRoleScheme.optional(),
  isBlocked: z.boolean().optional(),
  forbidden: z.number().optional(),
})
