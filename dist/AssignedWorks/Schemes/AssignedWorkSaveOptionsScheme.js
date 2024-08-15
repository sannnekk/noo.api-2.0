import { z } from 'zod';
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme.js';
import { AssignedWorkCommentScheme } from './AssignedWorkCommentScheme.js';
export const AssignedWorkSaveOptionsScheme = z.object({
    answers: z.array(AssignedWorkAnswerScheme),
    comments: z.array(AssignedWorkCommentScheme).optional(),
});
