import { z } from 'zod'

export const EmailScheme = z
  .string()
  .email({ message: 'Неверный формат почты' })
