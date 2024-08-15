import { z } from 'zod';
export const StatisticsOptionsScheme = z.object({
    from: z.date(),
    to: z.date(),
    type: z.string().optional(), // TODO: use enum from work module
});
