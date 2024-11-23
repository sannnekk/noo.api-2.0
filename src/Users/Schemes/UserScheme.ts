import { z, ZodType } from 'zod'
import { UserAvatarScheme } from './UserAvatarScheme'
import { User } from '../Data/User'
import { UserRoleScheme } from '@modules/Core/Schemes/UserRoleScheme'

interface UserSchemeOptions {
  withVerificationToken: boolean
  withPassword: boolean
  withNewEmail: boolean
  withAvatar: boolean
}

export const UserScheme = (
  options: UserSchemeOptions = {
    withVerificationToken: false,
    withPassword: false,
    withNewEmail: false,
    withAvatar: false,
  }
): ZodType<User> => {
  return z.object({
    id: z.string().ulid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    slug: z.string(),
    username: z.string(),
    email: z.string().email(),
    newEmail: options.withNewEmail ? z.string().email() : z.null(),
    role: UserRoleScheme,
    name: z.string(),
    verificationToken: options.withVerificationToken ? z.string() : z.null(),
    password: options.withPassword ? z.string() : z.undefined().optional(),
    avatar: options.withAvatar ? UserAvatarScheme : z.null(),
    telegramUsername: z.string().nullable(),
    telegramId: z.string().nullable(),
    telegramNotificationsEnabled: z.boolean(),
    isBlocked: z.boolean(),
    forbidden: z.number().optional(),
  })
}
