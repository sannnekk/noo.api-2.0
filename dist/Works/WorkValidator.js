var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ErrorConverter, Validator } from '../core/index.js';
import { z } from 'zod';
let WorkValidator = class WorkValidator extends Validator {
    validateCreation(data) {
        const schema = z.object({
            name: z.string().min(1).max(100),
            description: z.string(),
            tasks: z.array(z.object({
                content: z.any(),
                highestScore: z.number().int().positive(),
                type: z.enum([
                    'text',
                    'one_choice',
                    'multiple_choice',
                    'word',
                ]),
                rightAnswer: z.string().optional(),
                options: z
                    .array(z.object({
                    name: z.string(),
                    isCorrect: z.boolean(),
                }))
                    .optional(),
            })),
        });
        schema.parse(data);
    }
    validateUpdate(data) {
        const schema = z.object({
            id: z.string().ulid(),
            name: z.string().min(1).max(100).optional(),
            description: z.string().optional(),
            tasks: z
                .array(z.object({
                id: z.string().ulid().optional(),
                name: z.string().optional(),
                content: z.any().optional(),
                type: z
                    .enum(['text', 'one_choice', 'multiple_choice', 'word'])
                    .optional(),
                rightAnswer: z.string().optional().nullable(),
                options: z
                    .array(z.object({
                    id: z.string().ulid().optional(),
                    name: z.string().optional(),
                    isCorrect: z.boolean().optional(),
                }))
                    .optional(),
                highestScore: z.number().int().positive().optional(),
            }))
                .optional(),
        });
        schema.parse(data);
    }
};
WorkValidator = __decorate([
    ErrorConverter()
], WorkValidator);
export { WorkValidator };
