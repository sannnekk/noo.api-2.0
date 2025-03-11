import { z } from 'zod'
import { MaterialScheme } from './MaterialScheme'

function checkChapterDepth(
  node: any,
  maxDepth: number,
  currentDepth = 0
): boolean {
  if (currentDepth > maxDepth) return false

  return (
    node.chapters?.every((child: any) =>
      checkChapterDepth(child, maxDepth, currentDepth + 1)
    ) ?? true
  )
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
    order: z.number(),
    isActive: z.boolean().optional(),
    chapters: z.lazy((): any => z.array(ChapterScheme)).optional(),
    materials: z.array(MaterialScheme),
  })
  .refine((data) => checkChapterDepth(data, 2), {
    message: 'Глубина главы не может быть больше 2',
  })
