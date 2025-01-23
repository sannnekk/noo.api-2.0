import { z } from 'zod'

export const VideoCommentScheme = z.object({
  id: z.string().ulid().optional(),
  text: z
    .string()
    .min(1, {
      message: 'Комментарий не может быть пустым',
    })
    .max(250, {
      message: 'Комментарий не может быть больше 250 символов',
    }),
})
