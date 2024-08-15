var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator } from '../Core/Request/Validator.js';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { LoginScheme } from './Schemes/LoginScheme.js';
import { RegistrationScheme } from './Schemes/RegisterScheme.js';
import { VerificationScheme } from './Schemes/VerificationScheme.js';
import { ResendVerificationScheme } from './Schemes/ResendVerificationScheme.js';
import { ForgotPasswordScheme } from './Schemes/ForgotPasswordScheme.js';
import { EmailChangeVerificationScheme } from '../Users/Schemes/EmailChangeVerificationScheme.js';
let AuthValidator = class AuthValidator extends Validator {
    parseRegister(data) {
        return this.parse(data, RegistrationScheme);
    }
    parseLogin(user) {
        return this.parse(user, LoginScheme);
    }
    parseVerification(data) {
        return this.parse(data, VerificationScheme);
    }
    parseResendVerification(data) {
        return this.parse(data, ResendVerificationScheme);
    }
    validateForgotPassword(data) {
        return this.parse(data, ForgotPasswordScheme);
    }
    parseEmailChangeVerification(data) {
        return this.parse(data, EmailChangeVerificationScheme);
    }
};
AuthValidator = __decorate([
    ErrorConverter()
], AuthValidator);
export { AuthValidator };
