import { z } from 'zod'
import { UserRoles } from '../Security/roles'

export const UserRoleScheme = z.enum(
  Object.keys(UserRoles) as [string, ...string[]]
)
