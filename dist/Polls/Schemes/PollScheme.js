import { z } from 'zod';
import { PollVisibilityOptionsScheme } from './PollVisibilityOptionsScheme.js';
import { PollQuestionScheme } from './PollQuestionScheme.js';
export const PollScheme = z.object({
    id: z.string().ulid().optional().nullable(),
    title: z
        .string()
        .min(2, { message: 'Название опроса не может быть менее 2 символов' })
        .max(150, { message: 'Название опроса не может быть более 150 символов' }),
    description: z
        .string()
        .max(500, {
        message: 'Описание опроса не может быть более 500 символов',
    })
        .optional(),
    requireAuth: z.boolean(),
    stopAt: z.date(),
    canSeeResults: z.array(PollVisibilityOptionsScheme),
    canVote: z.array(PollVisibilityOptionsScheme),
    questions: z.array(PollQuestionScheme),
});
