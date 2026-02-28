import { MediaScheme } from '@modules/Media/Schemes/MediaScheme'
import { z } from 'zod'
import { ChapterScheme } from './ChapterScheme'

export const CourseScheme = z.object({
  id: z.string().ulid().optional(),
  slug: z.string().optional().nullable(),
  name: z
    .string()
    .min(1, { message: 'Название курса слишком короткое' })
    .max(255, {
      message: 'Название курса не может быть длиннее 255 символов',
    }),
  description: z
    .string()
    .max(255, {
      message: 'Описание курса не может быть длиннее 255 символов',
    })
    .optional(),
  images: z.array(MediaScheme),
  chapters: z.array(ChapterScheme),
  authors: z
    .array(
      z.object({
        id: z.string().ulid(),
      })
    )
    .max(10, { message: 'Количество авторов не может превышать 10' })
    .optional(),
  editors: z
    .array(
      z.object({
        id: z.string().ulid(),
      })
    )
    .max(10, { message: 'Количество редакторов не может превышать 10' })
    .optional(),
  subject: z.object(
    {
      id: z.string().ulid(),
    },
    { message: 'Предмет не указан' }
  ),
})
