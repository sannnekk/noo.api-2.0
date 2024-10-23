import { z } from 'zod';
import { WorkTypeScheme } from './WorkTypeScheme.js';
import { TaskScheme } from './TaskScheme.js';
export const WorkScheme = z.object({
    id: z.string().optional(),
    slug: z.string().optional(),
    name: z
        .string()
        .min(1, 'Нет названия работы')
        .max(200, 'Название работы слишком длинное, максимум 100 символов разрешено'),
    type: WorkTypeScheme,
    description: z.string().optional(),
    tasks: z.array(TaskScheme),
    subject: z.object({
        id: z.string().ulid(),
    }),
});
