import { EmailScheme } from '@modules/Core/Schemes/EmailScheme'
import { z } from 'zod'

export const EmailUpdateScheme = z.object({ email: EmailScheme })
