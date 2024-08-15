import { z } from 'zod'

export const UsernameScheme = z
  .string()
  .min(3, {
    message: 'Никнейм должен быть длиннее двух символов',
  })
  .max(32, {
    message: 'Никнейм должен быть короче 32 символов',
  })
  .regex(/^[A-Za-z0-9_-]+$/i)
