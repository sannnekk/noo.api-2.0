import { z } from 'zod'
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme'
import { AssignedWorkCommentScheme } from './AssignedWorkCommentScheme'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'

export const AssignedWorkSaveOptionsScheme = z.object({
  answers: z.array(AssignedWorkAnswerScheme),
  comments: z.array(AssignedWorkCommentScheme).optional(),
  studentComment: DeltaScheme.nullable().optional(),
  mentorComment: DeltaScheme.nullable().optional(),
})
