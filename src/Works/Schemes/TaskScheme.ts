import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { z } from 'zod'
import { CheckingStrategyScheme } from './CheckingStrategyScheme'
import { TaskTypeScheme } from './TaskTypeScheme'

export const TaskScheme = z.object({
  id: z.string().optional(),
  slug: z.string().optional().nullable(),
  content: DeltaScheme.nullable().optional(),
  order: z.number(),
  highestScore: z.number().int(),
  type: TaskTypeScheme,
  rightAnswer: z.string().nullable().optional(),
  solveHint: DeltaScheme.nullable().optional(),
  checkHint: DeltaScheme.nullable().optional(),
  checkingStrategy: CheckingStrategyScheme.nullable().optional(),
  isAnswerVisibleBeforeCheck: z.boolean(),
})
