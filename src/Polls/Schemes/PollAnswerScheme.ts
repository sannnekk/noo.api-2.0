import { z } from 'zod'
import { PollQuestionTypeSceme } from './PollQuestionTypeScheme'

export const PollAnswerScheme = z.object({
  id: z.string().ulid().optional(),
  userAuthType: z.string().min(1).optional(),
  userAuthData: z.record(z.any()).optional(),
  questionId: z.string().ulid(),
  questionType: PollQuestionTypeSceme,
  text: z.string().optional(),
  number: z.number().optional(),
  date: z.date().optional(),
  files: z.array(z.any()).optional(),
  choices: z.array(z.string()).optional(),
  rating: z.number().optional(),
})
