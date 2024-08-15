import { UserRoles } from '../../Core/Security/roles.js';
import { z } from 'zod';
export const PollVisibilityOptionsScheme = z.enum([
    'everyone',
    ...Object.keys(UserRoles),
]);
