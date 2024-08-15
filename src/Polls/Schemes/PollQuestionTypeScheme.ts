import { z } from 'zod'

export const PollQuestionTypeSceme = z.enum([
  'text',
  'date',
  'rating',
  'file',
  'choice',
  'number',
])
