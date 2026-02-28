import { z } from 'zod'
import { BlogPostTagsScheme } from './BlogPostTagsScheme'
import { MediaScheme } from '@modules/Media/Schemes/MediaScheme'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { PollScheme } from '@modules/Polls/Schemes/PollScheme'

export const BlogPostScheme = z.object({
  id: z.string().ulid().optional(),
  title: z
    .string()
    .min(1, 'У поста должно быть название')
    .max(255, 'Название поста слишком длинное, максимум 255 символов'),
  content: DeltaScheme.optional(),
  tags: BlogPostTagsScheme.optional(),
  files: z.array(MediaScheme).optional(),
  poll: PollScheme.nullable().optional(),
})
