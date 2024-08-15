import { z } from 'zod'
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme'

export const AssignedWorkSolveOptionsScheme = z.object({
  answers: z.array(AssignedWorkAnswerScheme),
})
