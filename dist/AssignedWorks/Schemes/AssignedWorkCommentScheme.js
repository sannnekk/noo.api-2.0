import { DeltaScheme } from '../../Core/Schemas/DeltaScheme.js';
import { z } from 'zod';
export const AssignedWorkCommentScheme = z.object({
    id: z.string().optional(),
    slug: z.string().nullable().optional(),
    content: DeltaScheme.nullable().optional(),
    score: z.number(),
    detailedScore: z.record(z.number()).nullable().optional(),
    taskId: z.string().ulid(),
});
