import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { UserRoleScheme } from '@modules/Core/Schemes/UserRoleScheme'
import { z } from 'zod'

export const FAQArticleScheme = z.object({
  id: z.string().ulid().optional(),
  for: z.union([z.literal('all'), UserRoleScheme]),
  title: z.string().min(1, { message: 'Название не должно быть пустым' }),
  content: DeltaScheme,
})
