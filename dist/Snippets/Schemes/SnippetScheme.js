import { DeltaScheme } from '../../Core/Schemas/DeltaScheme.js';
import { z } from 'zod';
export const SnippetSchema = z.object({
    id: z.string().ulid().nullable().optional(),
    name: z
        .string()
        .min(1, {
        message: 'Название сниппета должно содержать хотя бы один символ',
    })
        .max(255, {
        message: 'Название сниппета не должно превышать 255 символов',
    }),
    content: DeltaScheme,
    userId: z.string().ulid(),
});
