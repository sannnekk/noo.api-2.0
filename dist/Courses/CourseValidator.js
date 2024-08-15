var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { Validator } from '../Core/Request/Validator.js';
import { z } from 'zod';
import { CourseScheme } from './Schemes/CourseScheme.js';
import { ChapterScheme } from './Schemes/ChapterScheme.js';
import { AssignWorkOptionsScheme } from './Schemes/AssignWorkOptionsScheme.js';
import { EmailScheme } from '../Core/Schemes/EmailScheme.js';
let CourseValidator = class CourseValidator extends Validator {
    studentIdsScheme = z.object({
        studentIds: z.array(z.string().ulid()),
    });
    studentEmailsScheme = z.object({
        emails: z.array(EmailScheme),
    });
    parseCreation(course) {
        return this.parse(course, CourseScheme);
    }
    parseChapterCreation(chapter) {
        return this.parse(chapter, ChapterScheme);
    }
    parseUpdate(course) {
        return this.parse(course, CourseScheme);
    }
    parseStudentIds(body) {
        return this.parse(body, this.studentIdsScheme);
    }
    parseEmails(body) {
        return this.parse(body, this.studentEmailsScheme);
    }
    parseAssignWorkOptions(data) {
        return this.parse(data, AssignWorkOptionsScheme);
    }
};
CourseValidator = __decorate([
    ErrorConverter()
], CourseValidator);
export { CourseValidator };
