import { z } from 'zod'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { MediaScheme } from '@modules/Media/Schemes/MediaScheme'
import { VideoChapterScheme } from './VideoChapterScheme'

export const VideoScheme = z.object({
  id: z.string().ulid().optional(),
  title: z
    .string()
    .min(1, {
      message: 'Название видео не должно быть пустым',
    })
    .max(100, {
      message: 'Название видео не должно превышать 100 символов',
    }),
  description: DeltaScheme.nullable(),
  thumbnail: MediaScheme.nullable(),
  sizeInBytes: z.number().int().min(0),
  serviceType: z.literal('yandex'),
  state: z.enum(['not-uploaded', 'uploaded', 'uploading', 'failed']),
  duration: z.number().int().min(0),
  chapters: z.array(VideoChapterScheme),
  publishedAt: z.date().nullable(),
  accessType: z.enum(['everyone', 'courseId', 'mentorId', 'role']),
  accessValue: z.string().nullable(),
})
