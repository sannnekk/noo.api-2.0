import { Validator } from '../core/index';
import { z } from 'zod';
export class AssignedWorkValidator extends Validator {
    validateCreation(data) {
        const schema = z.object({
            studentId: z.string().ulid(),
            workId: z.string().ulid(),
        });
        schema.parse(data);
    }
    validateUpdate(data) {
        const schema = z.object({
            id: z.string().ulid(),
            studentId: z.string().ulid().optional(),
            workId: z.string().ulid().optional(),
            mentorIds: z.array(z.string().ulid()).optional(),
            solveDeadlineAt: z.date().optional(),
            checkDeadlineAt: z.date().optional(),
            solvedAt: z.date().optional(),
            checkedAt: z.date().optional(),
            score: z.number().optional(),
            answers: z
                .array(z.object({
                content: z.any().optional(),
                word: z.string().optional(),
                chosenTaskOptionIds: z.array(z.string().ulid()).optional(),
                taskId: z.string().ulid(),
            }))
                .optional(),
            comments: z
                .array(z.object({
                content: z.any().optional(),
                score: z.number().optional(),
                taskId: z.string().ulid(),
            }))
                .optional(),
        });
        schema.parse(data);
    }
}
