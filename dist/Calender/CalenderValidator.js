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
    eventVisibilityScheme = z.enum([
        'all',
        'own-students',
        'all-mentors',
        'own-mentor',
        'private',
    ]);
    eventCreationScheme = z.object({
        title: z
            .string()
            .min(1, 'Название события не должно быть пустым')
            .max(255, 'Название события не должно превышать 255 символов'),
        description: z.string().optional(),
        date: z.date(),
        visibility: this.eventVisibilityScheme,
    });
    parseEventCreation(event) {
        return this.parse(event, this.eventCreationScheme);
    }
};
CalenderValidator = __decorate([
    ErrorConverter()
], CalenderValidator);
export { CalenderValidator };
