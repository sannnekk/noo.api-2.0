import { z } from 'zod';
export const AssignedWorkRemakeOptionsScheme = z.object({
    onlyFalse: z.boolean().optional(),
});
