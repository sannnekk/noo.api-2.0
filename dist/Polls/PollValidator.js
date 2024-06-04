var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator } from '../Core/Request/Validator.js';
import { z } from 'zod';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { UserRoles } from '../Core/Security/roles.js';
let PollValidator = class PollValidator extends Validator {
    visibilityOptionsScheme = z.enum([
        'everyone',
        ...Object.keys(UserRoles),
    ]);
    questionTypeSceme = z.enum([
        'text',
        'date',
        'rating',
        'file',
        'choice',
        'number',
    ]);
    questionScheme = z.object({
        text: z.string(),
        description: z.string().optional(),
        type: this.questionTypeSceme,
        required: z.boolean(),
        // choice
        choices: z.array(z.string()).optional(),
        minChoices: z.number().min(0).max(99).optional(),
        maxChoices: z.number().min(1).max(99).optional(),
        // rating
        minRating: z.number().optional(),
        maxRating: z.number().optional(),
        onlyIntegerRating: z.boolean().optional(),
        // file
        maxFileSize: z.number().min(1).max(50).optional(),
        maxFileCount: z.number().min(1).max(10).optional(),
        allowedFileTypes: z
            .array(z.enum(['image/jpeg', 'image/png', 'application/pdf']))
            .optional(),
        // text
        minLength: z.number().min(0).max(999).optional(),
        maxLength: z.number().min(1).max(9999).optional(),
        // number
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        onlyIntegerValue: z.boolean().optional(),
        // date
        onlyFutureDate: z.boolean().optional(),
        onlyPastDate: z.boolean().optional(),
    });
    pollScheme = z.object({
        title: z.string(),
        description: z.string().optional(),
        requireAuth: z.boolean(),
        stopAt: z.date(),
        isStopped: z.boolean(),
        canSeeResults: z.array(this.visibilityOptionsScheme),
        canVote: z.array(this.visibilityOptionsScheme),
        questions: z.array(this.questionScheme),
    });
    pollAnswerScheme = z.object({
        id: z.string().ulid().optional(),
        questionId: z.string().ulid(),
        questionType: this.questionTypeSceme,
        text: z.string().optional(),
        number: z.number().optional(),
        date: z.date().optional(),
        files: z.array(z.any()).optional(),
        choices: z.array(z.string()).optional(),
        rating: z.number().optional(),
    });
    parsePoll(data) {
        return this.parse(data, this.pollScheme);
    }
    parsePollAnswers(data) {
        return this.parse(data, z.array(this.pollAnswerScheme));
    }
    parsePollAnswer(data) {
        return this.parse(data, this.pollAnswerScheme);
    }
};
PollValidator = __decorate([
    ErrorConverter()
], PollValidator);
export { PollValidator };
