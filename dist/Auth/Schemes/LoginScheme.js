import { EmailScheme } from '../../Core/Schemes/EmailScheme.js';
import { UsernameScheme } from './UsernameScheme.js';
import { z } from 'zod';
export const LoginScheme = z.object({
    usernameOrEmail: UsernameScheme.or(EmailScheme),
    password: z.string().min(1).max(128),
});
