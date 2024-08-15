var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { Validator } from '../Core/Request/Validator.js';
import { UserRoleScheme } from '../Core/Schemes/UserRoleScheme.js';
import { UpdatePasswordScheme } from './Schemes/UpdatePasswordScheme.js';
import { TelegramUpdateScheme } from './Schemes/TelegramUpdateScheme.js';
import { EmailUpdateScheme } from './Schemes/EmailUpdateScheme.js';
import { UserUpdateScheme } from './Schemes/UserUpdateScheme.js';
import { z } from 'zod';
let UserValidator = class UserValidator extends Validator {
    parseRole(role) {
        return this.parse(role, z.object({ role: UserRoleScheme }));
    }
    parseUpdate(user) {
        return this.parse(user, UserUpdateScheme);
    }
    parseUpdatePassword(data) {
        return this.parse(data, UpdatePasswordScheme);
    }
    parseTelegramUpdate(data) {
        return this.parse(data, TelegramUpdateScheme);
    }
    parseEmailUpdate(data) {
        return this.parse(data, EmailUpdateScheme);
    }
};
UserValidator = __decorate([
    ErrorConverter()
], UserValidator);
export { UserValidator };
