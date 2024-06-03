import { z } from 'zod';
export const DeltaScheme = z.object({
    ops: z.array(z
        .object({
        insert: z.any().optional(),
        attributes: z.any().optional(),
    })
        .partial()),
});
