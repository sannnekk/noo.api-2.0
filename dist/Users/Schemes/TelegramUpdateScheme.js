import { z } from 'zod';
export const TelegramUpdateScheme = z.object({
    telegramId: z.string(),
    telegramUsername: z.string().nullable().optional(),
    telegramAvatarUrl: z.string().nullable().optional(),
});
