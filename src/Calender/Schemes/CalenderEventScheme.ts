import { z } from 'zod'
import { CalenderEventVisibilityScheme } from './CalenderEventVisibilityScheme'

export const CalenderEventScheme = z.object({
  title: z
    .string()
    .min(1, 'Название события не должно быть пустым')
    .max(255, 'Название события не должно превышать 255 символов'),
  description: z.string().optional(),
  date: z.date(),
  visibility: CalenderEventVisibilityScheme,
})
