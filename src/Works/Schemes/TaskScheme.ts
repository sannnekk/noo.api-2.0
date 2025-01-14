import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { z } from 'zod'
import { CheckingStrategyScheme } from './CheckingStrategyScheme'
import { TaskTypeScheme } from './TaskTypeScheme'

export const TaskScheme = z.object({
  id: z.string().optional(),
  slug: z.string().optional().nullable(),
  content: DeltaScheme.nullable().optional(),
  order: z.number(),
  highestScore: z
    .number()
    .int()
    .positive('Максимальный балл должен быть положительным числом')
    .default(1),
  type: TaskTypeScheme,
  rightAnswer: z.string().nullable().optional(),
  solveHint: DeltaScheme.nullable().optional(),
  checkHint: DeltaScheme.nullable().optional(),
  checkingStrategy: CheckingStrategyScheme.nullable().optional(),
  isAnswerVisibleBeforeCheck: z.boolean().default(false),
  isCheckOneByOneEnabled: z.boolean().default(false),
})
