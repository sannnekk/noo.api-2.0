var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { Validator } from '../Core/Request/Validator.js';
import { z } from 'zod';
import { DeltaScheme } from '../Core/Schemas/DeltaScheme.js';
let WorkValidator = class WorkValidator extends Validator {
    workTypeScheme = z.enum([
        'trial-work',
        'phrase',
        'mini-test',
        'test',
        'second-part',
    ]);
    taskTypeScheme = z.enum([
        'text',
        'one_choice',
        'multiple_choice',
        'word',
    ]);
    checkingStrategyScheme = z.enum(['type1', 'type2', 'type3', 'type4']);
    taskScheme = z.object({
        id: z.string().optional(),
        content: DeltaScheme,
        order: z.number(),
        highestScore: z.number().int().positive(),
        type: this.taskTypeScheme,
        rightAnswer: z.string().optional(),
        solveHint: DeltaScheme.optional(),
        checkHint: DeltaScheme.optional(),
        checkingStrategy: this.checkingStrategyScheme.optional(),
    });
    workScheme = z.object({
        id: z.string().optional(),
        slug: z.string().optional(),
        name: z
            .string()
            .min(1, 'Нет названия работы')
            .max(100, 'Название работы слишком длинное, максимум 100 символов разрешено'),
        type: this.workTypeScheme,
        description: z.string().optional(),
        tasks: z.array(this.taskScheme),
    });
    parseCreation(data) {
        return this.parse(data, this.workScheme.omit({ id: true }));
    }
    parseUpdate(data) {
        return this.parse(data, this.workScheme);
    }
};
WorkValidator = __decorate([
    ErrorConverter()
], WorkValidator);
export { WorkValidator };
