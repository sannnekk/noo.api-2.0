import { z } from 'zod';
import { PollVisibilityOptionsScheme } from './PollVisibilityOptionsScheme.js';
import { PollQuestionScheme } from './PollQuestionScheme.js';
export const PollScheme = z.object({
    title: z.string(),
    description: z.string().optional(),
    requireAuth: z.boolean(),
    stopAt: z.date(),
    isStopped: z.boolean(),
    canSeeResults: z.array(PollVisibilityOptionsScheme),
    canVote: z.array(PollVisibilityOptionsScheme),
    questions: z.array(PollQuestionScheme),
});
