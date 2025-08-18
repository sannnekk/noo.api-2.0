import { z } from 'zod'

export const VideoCommentScheme = z.object({
  id: z.string().ulid().optional(),
  text: z
    .string()
    .min(1, {
      message: 'Комментарий не может быть пустым',
    })
    .max(512, {
      message: 'Комментарий не может иметь более 512 символов',
    }),
  user: z
    .object({
      id: z.string().ulid(),
    })
    .optional(),
  video: z
    .object({
      id: z.string().ulid(),
    })
    .optional(),
})
