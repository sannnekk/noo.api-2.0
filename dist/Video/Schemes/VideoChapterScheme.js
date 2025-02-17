import { z } from 'zod';
export const VideoChapterScheme = z.object({
    id: z.string().ulid().optional(),
    title: z
        .string()
        .min(1, {
        message: 'Название главы не должно быть пустым',
    })
        .max(100, {
        message: 'Название главы не должно превышать 100 символов',
    }),
    description: z
        .string()
        .max(250, {
        message: 'Описание главы не должно превышать 250 символов',
    })
        .nullable(),
    timestamp: z.number().int().min(0, {
        message: 'Время начала главы должно быть неотрицательным числом',
    }),
});
