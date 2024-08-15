import { EmailScheme } from '../../Core/Schemes/EmailScheme.js';
import { z } from 'zod';
export const ForgotPasswordScheme = z.object({
    email: EmailScheme,
});
