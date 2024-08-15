import { EmailScheme } from '../../Core/Schemes/EmailScheme.js';
import { z } from 'zod';
export const ResendVerificationScheme = z.object({
    email: EmailScheme,
});
