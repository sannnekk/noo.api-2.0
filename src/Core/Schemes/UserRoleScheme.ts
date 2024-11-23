import { z, ZodType } from 'zod'
import { UserRoles } from '../Security/roles'
import { User } from '@modules/Users/Data/User'

export const UserRoleScheme = z.enum(
  Object.keys(UserRoles) as [string, ...string[]]
) as ZodType<User['role']>
