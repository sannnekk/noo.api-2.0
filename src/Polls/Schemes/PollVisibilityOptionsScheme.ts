import { UserRoles } from '@modules/Core/Security/roles'
import { z } from 'zod'

export const PollVisibilityOptionsScheme = z.enum([
  'everyone',
  ...Object.keys(UserRoles),
] as [string, ...string[]])
