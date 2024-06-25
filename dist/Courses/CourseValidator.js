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
import { MediaScheme } from '../Media/MediaScheme.js';
let CourseValidator = class CourseValidator extends Validator {
    materialScheme = z.object({
        id: z.string().ulid().optional(),
        name: z
            .string()
            .min(1, { message: 'Название материала слишком короткое' })
            .max(255, {
            message: 'Название материала не может быть длиннее 255 символов',
        }),
        order: z.number(),
        description: z.string().nullable().optional(),
        content: DeltaScheme,
        files: z.array(MediaScheme),
    });
    chapterScheme = z.object({
        id: z.string().ulid().optional(),
        name: z
            .string()
            .min(1, { message: 'Название главы слишком короткое' })
            .max(255, {
            message: 'Название главы не может быть длиннее 255 символов',
        }),
        order: z.number(),
        materials: z.array(this.materialScheme),
    });
    courseScheme = z.object({
        id: z.string().ulid().optional(),
        name: z
            .string()
            .min(1, { message: 'Название курса слишком короткое' })
            .max(255, {
            message: 'Название курса не может быть длиннее 255 символов',
        }),
        description: z
            .string()
            .max(255, {
            message: 'Описание курса не может быть длиннее 255 символов',
        })
            .optional(),
        images: z.array(MediaScheme),
        chapters: z.array(this.chapterScheme),
    });
    stidentIdsScheme = z.object({
        studentIds: z.array(z.string().ulid()),
    });
    assignWorkOptionsScheme = z.object({
        checkDeadline: z.date().optional(),
        solveDeadline: z.date().optional(),
    });
    parseCreation(course) {
        return this.parse(course, this.courseScheme);
    }
    parseUpdate(course) {
        return this.parse(course, this.courseScheme);
    }
    parseStudentIds(body) {
        return this.parse(body, this.stidentIdsScheme);
    }
    parseAssignWorkOptions(data) {
        return this.parse(data, this.assignWorkOptionsScheme);
    }
};
CourseValidator = __decorate([
    ErrorConverter()
], CourseValidator);
export { CourseValidator };
