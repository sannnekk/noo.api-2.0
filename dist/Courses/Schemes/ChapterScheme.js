import { z } from 'zod';
import { MaterialScheme } from './MaterialScheme.js';
function checkChapterDepth(node, maxDepth, currentDepth = 0) {
    if (currentDepth > maxDepth)
        return false;
    return (node.chapters?.every((child) => checkChapterDepth(child, maxDepth, currentDepth + 1)) ?? true);
}
export const ChapterScheme = z
    .object({
    id: z.string().ulid().optional(),
    slug: z.string().optional().nullable(),
    name: z
        .string()
        .min(1, { message: 'Название главы слишком короткое' })
        .max(255, {
        message: 'Название главы не может быть длиннее 255 символов',
    }),
    titleColor: z.string().max(255).nullable(),
    order: z.number(),
    isActive: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    chapters: z.lazy(() => z.array(ChapterScheme)).optional(),
    materials: z.array(MaterialScheme),
})
    .refine((data) => checkChapterDepth(data, 2), {
    message: 'Глубина главы не может быть больше 2',
});
