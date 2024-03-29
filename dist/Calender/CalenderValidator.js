var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { Validator } from '../Core/Request/Validator.js';
import { z } from 'zod';
let CalenderValidator = class CalenderValidator extends Validator {
    validateEventCreation(event) {
        const schema = z.object({
            title: z.string(),
            description: z.string().optional(),
            date: z.date(),
            url: z.string().url().optional(),
            visibility: z.enum([
                'all',
                'own-students',
                'all-mentors',
                'own-mentor',
                'private',
            ]),
            type: z.enum([
                'student-deadline',
                'mentor-deadline',
                'work-checked',
                'work-made',
                'event',
            ]),
        });
        schema.parse(event);
    }
};
CalenderValidator = __decorate([
    ErrorConverter()
], CalenderValidator);
export { CalenderValidator };
