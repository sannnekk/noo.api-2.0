import { DeltaScheme } from '../../Core/Schemas/DeltaScheme.js';
import { MediaScheme } from '../../Media/Schemes/MediaScheme.js';
import { z } from 'zod';
export const MaterialScheme = z.object({
    id: z.string().ulid().optional(),
    slug: z.string().optional().nullable(),
    name: z
        .string()
        .min(1, { message: 'Название материала слишком короткое' })
        .max(255, {
        message: 'Название материала не может быть длиннее 255 символов',
    }),
    order: z.number(),
    isActive: z.boolean().optional(),
    description: z.string().nullable().optional(),
    content: DeltaScheme,
    files: z.array(MediaScheme),
});