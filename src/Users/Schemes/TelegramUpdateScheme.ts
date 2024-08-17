import { z } from 'zod'

export const TelegramUpdateScheme = z.object({
  telegramId: z.string().nullable(),
  telegramUsername: z.string().nullable().optional(),
  telegramAvatarUrl: z.string().nullable().optional(),
})
