import { z } from 'zod'
import { UsernameScheme } from './UsernameScheme'

export const VerificationScheme = z.object({
  token: z
    .string()
    .min(8, { message: 'Неверный токен' })
    .max(255, { message: 'Неверный токен' }),
  username: UsernameScheme,
})
