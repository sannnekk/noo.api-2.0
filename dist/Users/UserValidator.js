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
            name: z
                .string()
                .min(3, {
                message: 'ФИО должен быть длиннее двух символов',
            })
                .max(255, {
                message: 'ФИО должен быть короче 32 символов',
            }),
            username: z
                .string()
                .min(3, {
                message: 'Никнейм должен быть длиннее двух символов',
            })
                .max(32, {
                message: 'Никнейм должен быть короче 32 символов',
            })
                .regex(/^[A-Za-z0-9_-]+$/i),
            email: z.string().email({ message: 'Неверный формат почты' }),
            role: z.enum(Object.keys(UserRoles)),
            password: z
                .string()
                .min(8, {
                message: 'Пароль должен быть 8 символов или длиннее',
            })
                .max(255, {
                message: 'Пароль должен быть короче 255 символов',
            }),
            isBlocked: z.boolean().optional(),
            forbidden: z.number().optional(),
        });
        schema.parse(user);
    }
    validateLogin(user) {
        const schema = z.object({
            usernameOrEmail: z
                .string()
                .min(3, {
                message: 'Логин должен быть длиннее двух символов',
            })
                .max(32, {
                message: 'Логин должен быть короче 32 символов',
            }),
            password: z
                .string()
                .min(8, {
                message: 'Пароль должен быть 8 символов или длиннее',
            })
                .max(255, {
                message: 'Пароль должен быть короче 255 символов',
            }),
        });
        schema.parse(user);
    }
    validateVerification(data) {
        const schema = z.object({
            username: z
                .string()
                .min(3, { message: 'Неверный никнейм' })
                .max(32, { message: 'Неверный никнейм' }),
            token: z
                .string()
                .min(8, { message: 'Неверный токен' })
                .max(255, { message: 'Неверный токен' }),
        });
        schema.parse(data);
    }
    validateResendVerification(data) {
        const schema = z.object({
            email: z.string().email({
                message: 'Неверный формат почты',
            }),
        });
        schema.parse(data);
    }
    validateRegister(user) {
        const schema = z.object({
            name: z
                .string()
                .min(3, {
                message: 'ФИО должно быть длиннее двух символов',
            })
                .max(255, {
                message: 'ФИО должно быть короче 255 символов',
            }),
            username: z
                .string()
                .min(3, {
                message: 'Никнейм должен быть длиннее двух символов',
            })
                .max(32, {
                message: 'Никнейм должен быть короче 32 символов',
            })
                .regex(/^[A-Za-z0-9_-]+$/i, {
                message: 'Неверный формат никнейма',
            }),
            email: z.string().email({
                message: 'Неверный формат почты',
            }),
            password: z
                .string()
                .min(8, {
                message: 'Пароль должен быть 8 символов или длиннее',
            })
                .max(255, {
                message: 'Пароль должен быть короче 255 символов',
            }),
        });
        schema.parse(user);
    }
    validateUpdate(user) {
        const schema = z.object({
            id: z.string().ulid(),
            slug: z.string().min(3).max(32).optional(),
            name: z
                .string()
                .min(3, {
                message: 'ФИО должно быть длиннее двух символов',
            })
                .max(255, {
                message: 'ФИО должно быть короче 255 символов',
            })
                .optional(),
            username: z
                .string()
                .min(3, {
                message: 'Никнейм должен быть длиннее двух символов',
            })
                .max(32, {
                message: 'Никнейм должен быть короче 32 символов',
            })
                .regex(/^[A-Za-z0-9_-]+$/i, {
                message: 'Неверный формат никнейма',
            })
                .optional(),
            email: z
                .string()
                .email({
                message: 'Неверный формат почты',
            })
                .optional(),
            role: z.enum(Object.keys(UserRoles)).optional(),
            password: z
                .string()
                .min(8, {
                message: 'Пароль должен быть 8 символов или длиннее',
            })
                .max(255, {
                message: 'Пароль должен быть короче 255 символов',
            })
                .optional(),
            isBlocked: z.boolean().optional(),
            forbidden: z.number().optional(),
            createdAt: z.date().optional(),
            updatedAt: z.date().optional(),
        });
        schema.parse(user);
    }
    validateForgotPassword(data) {
        const schema = z.object({
            email: z.string().email({
                message: 'Неверный формат почты',
            }),
        });
        schema.parse(data);
    }
};
UserValidator = __decorate([
    ErrorConverter()
], UserValidator);
export { UserValidator };
