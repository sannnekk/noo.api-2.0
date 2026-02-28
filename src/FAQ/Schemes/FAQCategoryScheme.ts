import { z } from 'zod'

export const FAQCategoryScheme = z.object({
  id: z.string().ulid().optional(),
  name: z
    .string()
    .min(1, { message: 'Название не должно быть пустым' })
    .max(254, { message: 'Название не должно превышать 254 символа' }),
  order: z.number().int(),
  parentCategory: z.object({ id: z.string().ulid() }).nullable(),
})
