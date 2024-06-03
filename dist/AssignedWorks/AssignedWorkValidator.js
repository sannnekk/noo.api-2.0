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
let AssignedWorkValidator = class AssignedWorkValidator extends Validator {
    answerScheme = z.object({
        id: z.string().optional(),
        slug: z.string().optional(),
        content: DeltaScheme.optional(),
        word: z.string().optional(),
        taskId: z.string().ulid(),
    });
    commentScheme = z.object({
        id: z.string().optional(),
        slug: z.string().optional(),
        content: DeltaScheme.optional(),
        score: z.number(),
        taskId: z.string().ulid(),
    });
    remakeOptionsScheme = z.object({
        onlyFalse: z.boolean().optional(),
    });
    createOptionsScheme = z.object({
        studentId: z.string().ulid(),
        workId: z.string().ulid(),
    });
    solveOptionsScheme = z.object({
        answers: z.record(this.answerScheme),
    });
    checkOptionsScheme = z.object({
        answers: z.array(this.answerScheme),
        comments: z.array(this.commentScheme),
    });
    saveOptionsScheme = z.object({
        answers: z.array(this.answerScheme),
        comments: z.array(this.commentScheme).optional(),
    });
    parseRemake(body) {
        return this.parse(body, this.remakeOptionsScheme);
    }
    parseCreation(data) {
        return this.parse(data, this.createOptionsScheme);
    }
    parseSolve(data) {
        return this.parse(data, this.solveOptionsScheme);
    }
    parseCheck(data) {
        return this.parse(data, this.checkOptionsScheme);
    }
    parseSave(data) {
        return this.parse(data, this.saveOptionsScheme);
    }
};
AssignedWorkValidator = __decorate([
    ErrorConverter()
], AssignedWorkValidator);
export { AssignedWorkValidator };
