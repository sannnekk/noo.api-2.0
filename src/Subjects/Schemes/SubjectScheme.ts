import { z } from 'zod'

export const SubjectScheme = z.object({
  id: z.string().ulid().optional(),
  name: z
    .string()
    .min(1, { message: 'Название предмета слишком короткое' })
    .max(255, {
      message: 'Название предмета не может быть длиннее 255 символов',
    }),
  color: z.string(),
})
