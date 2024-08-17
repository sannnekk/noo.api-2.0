import { z } from 'zod';
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme.js';
import { DeltaScheme } from '../../Core/Schemas/DeltaScheme.js';
export const AssignedWorkSolveOptionsScheme = z.object({
    answers: z.array(AssignedWorkAnswerScheme),
    studentComment: DeltaScheme.nullable().optional(),
});
