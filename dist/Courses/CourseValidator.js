var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator, ErrorConverter } from '../core/index.js';
import { z } from 'zod';
let CourseValidator = class CourseValidator extends Validator {
    validateCreation(course) {
        const schema = z.object({
            name: z.string().min(3).max(255),
            description: z.string().max(255).optional(),
            chapters: z
                .array(z.object({
                name: z.string().max(255),
                materials: z
                    .array(z.object({
                    name: z.string().max(255),
                    description: z.string().optional(),
                    content: z.any().optional(),
                }))
                    .optional(),
            }))
                .optional(),
        });
        schema.parse(course);
    }
    validateUpdate(course) {
        const schema = z.object({
            id: z.string().ulid(),
            name: z.string().min(3).max(255).optional(),
            description: z.string().optional(),
            chapters: z
                .array(z.object({
                id: z.string().ulid().optional(),
                name: z.string().max(255).optional(),
                materials: z
                    .array(z.object({
                    id: z.string().ulid().optional(),
                    name: z.string().max(255).optional(),
                    description: z.string().optional(),
                    content: z.any().optional(),
                }))
                    .optional(),
            }))
                .optional(),
        });
        schema.parse(course);
    }
    validateStudentIds(body) {
        const schema = z.object({
            studentIds: z.array(z.string().ulid()),
        });
        schema.parse(body);
    }
    validateAssignWork(data) {
        const schema = z.object({
            checkDeadline: z.date().optional(),
            solveDeadline: z.date().optional(),
        });
        schema.parse(data);
    }
};
CourseValidator = __decorate([
    ErrorConverter()
], CourseValidator);
export { CourseValidator };
