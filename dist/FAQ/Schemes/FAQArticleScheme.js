import { DeltaScheme } from '../../Core/Schemas/DeltaScheme.js';
import { UserRoleScheme } from '../../Core/Schemes/UserRoleScheme.js';
import { z } from 'zod';
export const FAQArticleScheme = z.object({
    id: z.string().ulid().optional(),
    for: z.union([z.literal('all'), UserRoleScheme]),
    title: z.string().min(1, { message: 'Название не должно быть пустым' }),
    content: DeltaScheme,
});
