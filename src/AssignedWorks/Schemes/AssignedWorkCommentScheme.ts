import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { z } from 'zod'

export const AssignedWorkCommentScheme = z.object({
  id: z.string().optional(),
  slug: z.string().nullable().optional(),
  content: DeltaScheme.nullable().optional(),
  score: z.number(),
  taskId: z.string().ulid(),
})
