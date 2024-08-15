import { z } from 'zod'
import { PollVisibilityOptionsScheme } from './PollVisibilityOptionsScheme'
import { PollQuestionScheme } from './PollQuestionScheme'

export const PollScheme = z.object({
  title: z.string(),
  description: z.string().optional(),
  requireAuth: z.boolean(),
  stopAt: z.date(),
  isStopped: z.boolean(),
  canSeeResults: z.array(PollVisibilityOptionsScheme),
  canVote: z.array(PollVisibilityOptionsScheme),
  questions: z.array(PollQuestionScheme),
})
