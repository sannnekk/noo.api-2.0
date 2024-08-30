import { z } from 'zod';
export const NotificationTypeScheme = z.enum([
    'maintenance',
    'new-feature',
    'announcement',
    'other',
]);
