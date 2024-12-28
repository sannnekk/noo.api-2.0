import { DeltaScheme } from '../../Core/Schemas/DeltaScheme.js';
import { z } from 'zod';
import { CheckingStrategyScheme } from './CheckingStrategyScheme.js';
import { TaskTypeScheme } from './TaskTypeScheme.js';
export const TaskScheme = z.object({
    id: z.string().optional(),
    slug: z.string().optional().nullable(),
    content: DeltaScheme.nullable().optional(),
    order: z.number(),
    highestScore: z.number().int(),
    type: TaskTypeScheme,
    rightAnswer: z.string().nullable().optional(),
    solveHint: DeltaScheme.nullable().optional(),
    checkHint: DeltaScheme.nullable().optional(),
    checkingStrategy: CheckingStrategyScheme.nullable().optional(),
    isAnswerVisibleBeforeCheck: z.boolean().default(false),
    isCheckOneByOneEnabled: z.boolean().default(false),
});
