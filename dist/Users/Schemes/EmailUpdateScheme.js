import { EmailScheme } from '../../Core/Schemes/EmailScheme.js';
import { z } from 'zod';
export const EmailUpdateScheme = z.object({ email: EmailScheme });
