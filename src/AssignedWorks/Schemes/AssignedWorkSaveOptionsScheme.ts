import { z } from 'zod'
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme'
import { AssignedWorkCommentScheme } from './AssignedWorkCommentScheme'

export const AssignedWorkSaveOptionsScheme = z.object({
  answers: z.array(AssignedWorkAnswerScheme),
  comments: z.array(AssignedWorkCommentScheme).optional(),
})
