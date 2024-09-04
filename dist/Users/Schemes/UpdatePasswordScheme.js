import { z } from 'zod';
import { PasswordScheme } from '../../Auth/Schemes/PasswordScheme.js';
export const UpdatePasswordScheme = z.object({
    oldPassword: z.string().min(1).max(128).optional(),
    newPassword: PasswordScheme,
});
