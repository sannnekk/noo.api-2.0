import { z } from 'zod'
import { PollQuestionTypeSceme } from './PollQuestionTypeScheme'

export const PollQuestionScheme = z.object({
  text: z.string(),
  order: z.number(),
  description: z.string().optional(),
  type: PollQuestionTypeSceme,
  required: z.boolean(),

  // choice
  choices: z.array(z.string()).optional(),
  minChoices: z.number().min(0).max(99).optional(),
  maxChoices: z.number().min(1).max(99).optional(),

  // rating
  minRating: z.number().optional(),
  maxRating: z.number().optional(),
  onlyIntegerRating: z.boolean().optional(),

  // file
  maxFileSize: z.number().min(1).max(50).optional(),
  maxFileCount: z.number().min(1).max(10).optional(),
  allowedFileTypes: z
    .array(z.enum(['image/jpeg', 'image/png', 'application/pdf']))
    .optional(),

  // text
  minLength: z.number().min(0).max(999).optional(),
  maxLength: z.number().min(1).max(9999).optional(),

  // number
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  onlyIntegerValue: z.boolean().optional(),

  // date
  onlyFutureDate: z.boolean().optional(),
  onlyPastDate: z.boolean().optional(),
})
