import { z } from 'zod'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { MediaScheme } from '@modules/Media/Schemes/MediaScheme'
import { VideoChapterScheme } from './VideoChapterScheme'

export const VideoUpdateScheme = z.object({
  id: z.string().ulid().optional(),
  title: z
    .string()
    .min(1, {
      message: 'Название видео не должно быть пустым',
    })
    .max(100, {
      message: 'Название видео не должно превышать 100 символов',
    })
    .optional(),
  description: DeltaScheme.nullable().optional(),
  thumbnail: MediaScheme.nullable().optional(),
  chapters: z.array(VideoChapterScheme).optional(),
  accessType: z.enum(['everyone', 'courseId', 'mentorId', 'role']).optional(),
  accessValue: z.string().nullable().optional(),
  publishedAt: z.date().nullable().optional(),
})
