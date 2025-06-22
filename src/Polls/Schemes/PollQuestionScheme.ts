import { z } from 'zod'
import { PollQuestionTypeSceme } from './PollQuestionTypeScheme'

export const PollQuestionScheme = z.object({
  id: z.string().optional().nullable(),
  text: z
    .string()
    .min(2, { message: 'Вопрос не может быть менее 2 символов' })
    .max(150, { message: 'Вопрос не может быть более 150 символов' }),
  order: z.number(),
  description: z
    .string()
    .max(500, {
      message: 'Описание вопроса не может быть более 500 символов',
    })
    .optional()
    .nullable(),
  type: PollQuestionTypeSceme,
  required: z.boolean(),

  // choice
  choices: z.array(z.string()).optional().nullable(),
  minChoices: z
    .number()
    .min(0)
    .max(99, {
      message: 'Максимальное количество ответов не должно быть больше 99',
    })
    .optional()
    .nullable(),
  maxChoices: z
    .number()
    .min(1, {
      message: 'Минимальное количество ответов не должно быть меньше 1',
    })
    .max(99, {
      message: 'Минимальное количество ответов не должно быть больше 99',
    })
    .optional()
    .nullable(),

  // rating
  minRating: z.number().optional().nullable(),
  maxRating: z.number().optional().nullable(),
  onlyIntegerRating: z.boolean().optional().nullable(),

  // file
  maxFileSize: z
    .number()
    .min(1, {
      message: 'Максимальный размер файла не может быть меньше 1 Мб',
    })
    .max(80, {
      message: 'Максимальный размер файла не может быть больше 80 Мб',
    })
    .optional()
    .nullable(),
  maxFileCount: z
    .number()
    .min(1, {
      message: 'Максимальное количество файлов не может быть меньше 1',
    })
    .max(10, {
      message: 'Максимальное количество файлов не может быть больше 10',
    })
    .optional()
    .nullable(),
  allowedFileTypes: z
    .array(z.enum(['image/jpeg', 'image/png', 'application/pdf']))
    .optional()
    .nullable(),

  // text
  minLength: z.number().min(0).max(999).optional().nullable(),
  maxLength: z.number().min(1).max(9999).optional().nullable(),

  // number
  minValue: z.number().optional().nullable(),
  maxValue: z.number().optional().nullable(),
  onlyIntegerValue: z.boolean().optional().nullable(),

  // date
  onlyFutureDate: z.boolean().optional().nullable(),
  onlyPastDate: z.boolean().optional().nullable(),
})
