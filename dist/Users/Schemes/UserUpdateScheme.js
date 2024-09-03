//import { PasswordScheme } from '../../Auth/Schemes/PasswordScheme.js'
import { z } from 'zod';
import { UserAvatarScheme } from './UserAvatarScheme.js';
export const UserUpdateScheme = z.object({
    id: z.string().ulid(),
    name: z.string().optional(),
    //password: PasswordScheme.optional(),
    avatar: UserAvatarScheme.optional().nullable(),
    isBlocked: z.boolean().optional(),
    forbidden: z.number().optional(),
});
