import { z } from 'zod';
export const DeltaScheme = z.object({
    ops: z.any(),
});
