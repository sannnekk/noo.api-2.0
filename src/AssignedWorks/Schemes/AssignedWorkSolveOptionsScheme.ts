import { z } from 'zod'
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'

export const AssignedWorkSolveOptionsScheme = z.object({
  answers: z.array(AssignedWorkAnswerScheme),
  studentComment: DeltaScheme.nullable().optional(),
})
