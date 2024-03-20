var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { Validator } from '../Core/Request/Validator.js';
import { z } from 'zod';
let AssignedWorkValidator = class AssignedWorkValidator extends Validator {
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
            studentId: z.string().ulid().optional().nullable(),
            workId: z.string().ulid().optional().nullable(),
            mentorIds: z.array(z.string().ulid()).optional(),
            answers: z
                .array(z.object({
                content: z.any().optional().nullable(),
                word: z.string().optional().nullable(),
                taskId: z.string().ulid(),
            }))
                .optional(),
            comments: z
                .array(z.object({
                content: z.any().optional().nullable(),
                score: z.number().optional().nullable(),
                taskId: z.string().ulid(),
            }))
                .optional(),
        });
        schema.parse(data);
    }
};
AssignedWorkValidator = __decorate([
    ErrorConverter()
], AssignedWorkValidator);
export { AssignedWorkValidator };
