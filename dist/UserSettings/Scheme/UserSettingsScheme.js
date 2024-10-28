import { MediaScheme } from '../../Media/Schemes/MediaScheme.js';
import { z } from 'zod';
export const UserSettingsScheme = z.object({
    backgroundImage: MediaScheme.nullable().optional(),
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
});
