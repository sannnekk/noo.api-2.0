import { z } from 'zod';
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme.js';
export const AssignedWorkSolveOptionsScheme = z.object({
    answers: z.array(AssignedWorkAnswerScheme),
});
