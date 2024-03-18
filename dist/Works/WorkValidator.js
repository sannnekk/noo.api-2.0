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
            name: z
                .string()
                .min(1, 'Нет названия работы')
                .max(100, 'Название работы слишком длинное, максимум 100 символов разрешено'),
            type: z.enum([
                'trial-work',
                'phrase',
                'mini-test',
                'test',
                'second-part',
            ]),
            description: z.string().optional(),
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
                solveHint: z.any().optional(),
                checkHint: z.any().optional(),
                checkingStrategy: z
                    .enum(['type1', 'type2', 'type3', 'type4'])
                    .optional(),
            })),
        });
        schema.parse(data);
    }
    validateUpdate(data) {
        const schema = z.object({
            id: z.string().ulid(),
            type: z
                .enum([
                'trial-work',
                'phrase',
                'mini-test',
                'test',
                'second-part',
            ])
                .optional(),
            name: z
                .string()
                .min(1, 'Нет названия работы')
                .max(100, 'Название работы слишком длинное, максимум 100 символов разрешено')
                .optional(),
            description: z.string().optional(),
            tasks: z
                .array(z.object({
                id: z.string().ulid().optional(),
                content: z.any().optional(),
                type: z
                    .enum(['text', 'one_choice', 'multiple_choice', 'word'])
                    .optional(),
                rightAnswer: z.string().optional().nullable(),
                solveHint: z.any().optional().nullable(),
                checkHint: z.any().optional().nullable(),
                checkingStrategy: z
                    .enum(['type1', 'type2', 'type3', 'type4'])
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
