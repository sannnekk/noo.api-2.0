var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator } from '../Core/Request/Validator.js';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { z } from 'zod';
let GoogleDocsValidator = class GoogleDocsValidator extends Validator {
    googleDocsBindindScheme = z.object({
        name: z.string(),
        entityName: z.string(),
        entitySelector: z.object({
            prop: z.string(),
            value: z.string(),
        }),
        filePath: z.string(),
        googleCredentials: z.any(),
        googleOAuthToken: z.string(),
        status: z.enum(['active', 'inactive', 'error']),
        format: z.enum(['csv']),
        frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
    });
    parseGoogleDocsBinding(data) {
        return this.parse(data, this.googleDocsBindindScheme);
    }
};
GoogleDocsValidator = __decorate([
    ErrorConverter()
], GoogleDocsValidator);
export { GoogleDocsValidator };
