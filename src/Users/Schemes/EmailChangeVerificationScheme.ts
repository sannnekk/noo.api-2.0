import { UsernameScheme } from '@modules/Auth/Schemes/UsernameScheme'
import { z } from 'zod'

export const EmailChangeVerificationScheme = z.object({
  token: z
    .string()
    .min(8, { message: 'Неверный токен' })
    .max(255, { message: 'Неверный токен' }),
  username: UsernameScheme,
})
