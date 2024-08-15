import { z } from 'zod';
import { MaterialScheme } from './MaterialScheme.js';
export const ChapterScheme = z.object({
    id: z.string().ulid().optional(),
    slug: z.string().optional().nullable(),
    name: z
        .string()
        .min(1, { message: 'Название главы слишком короткое' })
        .max(255, {
        message: 'Название главы не может быть длиннее 255 символов',
    }),
    order: z.number(),
    isActive: z.boolean().optional(),
    materials: z.array(MaterialScheme),
});
