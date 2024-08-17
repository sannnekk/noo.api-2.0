import { z } from 'zod'
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme'
import { AssignedWorkCommentScheme } from './AssignedWorkCommentScheme'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'

export const AssignedWorkCheckOptionsScheme = z.object({
  answers: z.array(AssignedWorkAnswerScheme),
  comments: z.array(AssignedWorkCommentScheme),
  mentorComment: DeltaScheme.nullable().optional(),
})
