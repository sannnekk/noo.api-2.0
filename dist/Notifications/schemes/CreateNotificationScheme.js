import { z } from 'zod';
import { NotificationScheme } from './NotificationScheme.js';
import { NotificationSendOptionsScheme } from './NotificationSendOptionsScheme.js';
export const CreateNotificationScheme = z.object({
    notification: NotificationScheme,
    sendOptions: NotificationSendOptionsScheme,
});
