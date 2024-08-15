import { EmailScheme } from '@modules/Core/Schemes/EmailScheme'
import { z } from 'zod'

export const ForgotPasswordScheme = z.object({
  email: EmailScheme,
})
