import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { z } from 'zod'

export const AssignedWorkAnswerScheme = z.object({
  id: z.string().optional(),
  slug: z.string().nullable().optional(),
  content: DeltaScheme.nullable().optional(),
  word: z
    .string()
    .max(200, {
      message:
        'Ответ на вопрос в одну строку не может содержать больше 200 символов',
    })
    .nullable()
    .optional(),
  taskId: z.string().ulid(),
  isSubmitted: z.boolean().nullable().optional(),
})
