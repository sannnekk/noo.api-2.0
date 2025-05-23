var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { Validator } from '../Core/Request/Validator.js';
import { AssignedWorkRemakeOptionsScheme } from './Schemes/AssignedWorkRemakeOptionsScheme.js';
import { AssignedWorkCreateOptionsScheme } from './Schemes/AssignedWorkCreateOptionsScheme.js';
import { AssignedWorkSolveOptionsScheme } from './Schemes/AssignedWorkSolveOptionsScheme.js';
import { AssignedWorkCheckOptionsScheme } from './Schemes/AssignedWorkCheckOptionsScheme.js';
import { AssignedWorkSaveOptionsScheme } from './Schemes/AssignedWorkSaveOptionsScheme.js';
import { AssignedWorkAnswerScheme } from './Schemes/AssignedWorkAnswerScheme.js';
import { AssignedWorkCommentScheme } from './Schemes/AssignedWorkCommentScheme.js';
import { z } from 'zod';
import { DeltaScheme } from '../Core/Schemas/DeltaScheme.js';
let AssignedWorkValidator = class AssignedWorkValidator extends Validator {
    parseRemake(body) {
        return this.parse(body, AssignedWorkRemakeOptionsScheme);
    }
    parseCreation(data) {
        return this.parse(data, AssignedWorkCreateOptionsScheme);
    }
    parseSolve(data) {
        return this.parse(data, AssignedWorkSolveOptionsScheme);
    }
    parseCheck(data) {
        return this.parse(data, AssignedWorkCheckOptionsScheme);
    }
    parseSave(data) {
        return this.parse(data, AssignedWorkSaveOptionsScheme);
    }
    parseAnswer(data) {
        return this.parse(data, AssignedWorkAnswerScheme);
    }
    parseComment(data) {
        return this.parse(data, AssignedWorkCommentScheme);
    }
    parseWorkComments(data) {
        return this.parse(data, z.object({
            studentComment: DeltaScheme.nullable().optional(),
            mentorComment: DeltaScheme.nullable().optional(),
        }));
    }
    parseBulkFavouriteTasksRemove(data) {
        return this.parse(data, z.object({ ids: z.array(z.string().ulid()) }));
    }
};
AssignedWorkValidator = __decorate([
    ErrorConverter()
], AssignedWorkValidator);
export { AssignedWorkValidator };
