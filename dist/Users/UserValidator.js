var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { z } from 'zod';
import { ErrorConverter, UserRoles, Validator } from '../core/index.js';
let UserValidator = class UserValidator extends Validator {
    validateCreation(user) {
        const schema = z.object({
            name: z.string().min(3).max(255),
            username: z
                .string()
                .min(3)
                .max(32)
                .regex(/^[A-Za-z0-9_-]+$/i),
            email: z.string().email(),
            role: z.enum(Object.keys(UserRoles)),
            password: z.string().min(8).max(255),
            isBlocked: z.boolean().optional(),
            forbidden: z.number().optional(),
        });
        schema.parse(user);
    }
    validateLogin(user) {
        const schema = z.object({
            usernameOrEmail: z.string().min(3).max(32),
            password: z.string().min(8).max(255),
        });
        schema.parse(user);
    }
    validateVerification(data) {
        const schema = z.object({
            username: z.string().min(3).max(32),
            token: z.string().min(8).max(255),
        });
        schema.parse(data);
    }
    validateRegister(user) {
        const schema = z.object({
            name: z.string().min(3).max(255),
            username: z
                .string()
                .min(3)
                .max(32)
                .regex(/^[A-Za-z0-9_-]+$/i),
            email: z.string().email(),
            password: z.string().min(8).max(255),
        });
        schema.parse(user);
    }
    validateUpdate(user) {
        const schema = z.object({
            id: z.string().ulid(),
            slug: z.string().min(3).max(32).optional(),
            name: z.string().min(3).max(255).optional(),
            username: z
                .string()
                .min(3)
                .max(32)
                .regex(/^[A-Za-z0-9_-]+$/i)
                .optional(),
            email: z.string().email().optional(),
            role: z.enum(Object.keys(UserRoles)).optional(),
            password: z.string().min(8).max(255).optional(),
            isBlocked: z.boolean().optional(),
            forbidden: z.number().optional(),
            createdAt: z.date().optional(),
            updatedAt: z.date().optional(),
        });
        schema.parse(user);
    }
    validateForgotPassword(data) {
        const schema = z.object({
            email: z.string().email(),
        });
        schema.parse(data);
    }
};
UserValidator = __decorate([
    ErrorConverter()
], UserValidator);
export { UserValidator };
