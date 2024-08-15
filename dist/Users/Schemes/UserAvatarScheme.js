import { MediaScheme } from '../../Media/Schemes/MediaScheme.js';
import { z } from 'zod';
export const UserAvatarScheme = z.object({
    id: z.string().ulid().optional().nullable(),
    media: MediaScheme.nullable().optional(),
    avatarType: z.enum(['telegram', 'custom']),
    telegramAvatarUrl: z.string().optional().nullable(),
});
