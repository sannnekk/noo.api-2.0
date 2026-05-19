import { z } from 'zod'
import { UsernameScheme } from './UsernameScheme'
import { EmailScheme } from '@modules/Core/Schemes/EmailScheme'
import { PasswordScheme } from './PasswordScheme'

export const RegistrationScheme = z.object({
  name: z
    .string()
    .min(3, {
      message: 'ФИО должен быть длиннее двух символов',
    })
    .max(255, {
      message: 'ФИО должен быть короче 32 символов',
    }),
  username: UsernameScheme,
  email: EmailScheme,
  telegramUsername: z
    .string()
    .min(3, {
      message: 'Telegram должен быть длиннее двух символов',
    })
    .max(255, {
      message: 'Telegram должен быть короче 255 символов',
    }),
  password: PasswordScheme,
})
