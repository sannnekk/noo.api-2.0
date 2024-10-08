import { z } from 'zod'

export const PasswordScheme = z
  .string()
  .min(8, {
    message: 'Пароль должен быть 8 символов или длиннее',
  })
  .max(64, {
    message: 'Пароль должен быть короче 64 символов',
  })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Пароль должен содержать хотя бы одну цифру, одну заглавную и одну строчную букву',
  })
