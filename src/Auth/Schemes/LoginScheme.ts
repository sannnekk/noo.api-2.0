import { EmailScheme } from '@modules/Core/Schemes/EmailScheme'
import { UsernameScheme } from './UsernameScheme'
import { z } from 'zod'

export const LoginScheme = z.object({
  usernameOrEmail: UsernameScheme.or(EmailScheme),
  password: z.string().min(1).max(128),
})
