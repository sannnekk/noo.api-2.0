import { MediaScheme } from '@modules/Media/Schemes/MediaScheme'
import { z, ZodType } from 'zod'
import { UserAvatar } from '../Data/Relations/UserAvatar'

export const UserAvatarScheme: ZodType<UserAvatar> = z.object({
  id: z.string().ulid().optional() as ZodType<string>,
  createdAt: z.date().optional() as ZodType<Date>,
  updatedAt: z.date().optional() as ZodType<Date>,
  media: MediaScheme.nullable(),
  avatarType: z.enum(['telegram', 'custom']),
  telegramAvatarUrl: z.string().nullable(),
})
