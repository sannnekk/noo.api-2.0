import { z } from 'zod';
import { UserRoles } from '../Security/roles.js';
export const UserRoleScheme = z.enum(Object.keys(UserRoles));
