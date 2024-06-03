var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { z } from 'zod';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { Validator } from '../Core/Request/Validator.js';
import { UserRoles } from '../Core/Security/roles.js';
let UserValidator = class UserValidator extends Validator {
    userRoleScheme = z.enum(Object.keys(UserRoles));
    passwordScheme = z
        .string()
        .min(8, {
        message: 'Пароль должен быть 8 символов или длиннее',
    })
        .max(64, {
        message: 'Пароль должен быть короче 64 символов',
    })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Пароль должен содержать хотя бы одну цифру, одну заглавную и одну строчную букву',
    });
    usernameScheme = z
        .string()
        .min(3, {
        message: 'Никнейм должен быть длиннее двух символов',
    })
        .max(32, {
        message: 'Никнейм должен быть короче 32 символов',
    })
        .regex(/^[A-Za-z0-9_-]+$/i);
    emailScheme = z.string().email({ message: 'Неверный формат почты' });
    registerScheme = z.object({
        name: z
            .string()
            .min(3, {
            message: 'ФИО должен быть длиннее двух символов',
        })
            .max(255, {
            message: 'ФИО должен быть короче 32 символов',
        }),
        username: this.usernameScheme,
        email: this.emailScheme,
        password: this.passwordScheme,
    });
    updateScheme = z.object({
        id: z.string().ulid(),
        email: this.emailScheme.optional(),
        name: z.string().optional(),
        telegramUsername: z.string().optional(),
        password: this.passwordScheme.optional(),
        role: z.nativeEnum(UserRoles).optional(),
        isBlocked: z.boolean().optional(),
    });
    loginScheme = z.object({
        usernameOrEmail: this.usernameScheme.or(this.emailScheme),
        password: this.passwordScheme,
    });
    verificationScheme = z.object({
        token: z
            .string()
            .min(8, { message: 'Неверный токен' })
            .max(255, { message: 'Неверный токен' }),
        username: this.usernameScheme,
    });
    resendVerificationScheme = z.object({
        email: this.emailScheme,
    });
    forgotPasswordScheme = z.object({
        email: this.emailScheme,
    });
    parseRegister(data) {
        return this.parse(data, this.registerScheme);
    }
    parseLogin(user) {
        return this.parse(user, this.loginScheme);
    }
    parseVerification(data) {
        return this.parse(data, this.verificationScheme);
    }
    parseResendVerification(data) {
        return this.parse(data, this.resendVerificationScheme);
    }
    parseUpdate(user) {
        return this.parse(user, this.updateScheme);
    }
    validateForgotPassword(data) {
        return this.parse(data, this.forgotPasswordScheme);
    }
};
UserValidator = __decorate([
    ErrorConverter()
], UserValidator);
export { UserValidator };
