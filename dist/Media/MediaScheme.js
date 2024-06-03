import { z } from 'zod';
import { MediaOptions } from './MediaOptions.js';
export const MediaScheme = z.object({
    src: z.string(),
    name: z.string(),
    mimeType: z.enum(MediaOptions.allowedFileTypes),
});
