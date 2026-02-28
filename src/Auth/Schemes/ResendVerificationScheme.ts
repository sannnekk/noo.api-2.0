import { EmailScheme } from '@modules/Core/Schemes/EmailScheme'
import { z } from 'zod'

export const ResendVerificationScheme = z.object({
  email: EmailScheme,
})
