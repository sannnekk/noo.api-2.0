import { z } from 'zod';
import { UsernameScheme } from './UsernameScheme.js';
import { EmailScheme } from '../../Core/Schemes/EmailScheme.js';
import { PasswordScheme } from './PasswordScheme.js';
export const RegistrationScheme = z.object({
    name: z
        .string()
        .min(3, {
        message: 'ФИО должен быть длиннее двух символов',
    })
        .max(255, {
        message: 'ФИО должен быть короче 32 символов',
    }),
    username: UsernameScheme,
    email: EmailScheme,
    password: PasswordScheme,
});
