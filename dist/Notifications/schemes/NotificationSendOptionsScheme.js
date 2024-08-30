import { z } from 'zod';
export const NotificationSendOptionsScheme = z.object({
    selector: z.enum(['role', 'course', 'all']),
    value: z.string().nullable(),
});
