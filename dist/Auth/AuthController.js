var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Context } from '../Core/Request/Context.js';
import { Controller, Get, Patch, Post } from 'express-controller-decorator';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { AuthValidator } from './AuthValidator.js';
import { AuthService } from './Services/AuthService.js';
import { UserService } from '../Users/Services/UserService.js';
let AuthController = class AuthController {
    userValidator;
    authService;
    userService;
    constructor() {
        this.userValidator = new AuthValidator();
        this.authService = new AuthService();
        this.userService = new UserService();
    }
    async login(context) {
        try {
            const loginDTO = this.userValidator.parseLogin(context.body);
            const payload = await this.authService.login(loginDTO, context);
            return new ApiResponse({ data: payload });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async register(context) {
        try {
            const registerDTO = this.userValidator.parseRegister(context.body);
            await this.authService.register(registerDTO);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async checkUsername(context) {
        try {
            const username = this.userValidator.parseSlug(context.params.username);
            const exists = await this.authService.checkUsername(username);
            return new ApiResponse({ data: { exists } });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async resendVerification(context) {
        try {
            const resendVerificationDTO = this.userValidator.parseResendVerification(context.body);
            await this.authService.resendVerification(resendVerificationDTO.email);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async verify(context) {
        try {
            const verificationDTO = this.userValidator.parseVerification(context.body);
            await this.authService.verify(verificationDTO.username, verificationDTO.token);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async verifyEmailChange(context) {
        try {
            const emailChangeVerificationDTO = this.userValidator.parseEmailChangeVerification(context.body);
            await this.userService.confirmEmailUpdate(emailChangeVerificationDTO.username, emailChangeVerificationDTO.token);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async forgotPassword(context) {
        try {
            const forgotPasswordDTO = this.userValidator.validateForgotPassword(context.body);
            await this.authService.forgotPassword(forgotPasswordDTO.email);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
};
__decorate([
    Post('/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Post('/register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    Get('/check-username/:username'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkUsername", null);
__decorate([
    Post('/resend-verification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    Patch('/verify'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    Patch('/verify-email-change'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmailChange", null);
__decorate([
    Post('/forgot-password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
AuthController = __decorate([
    Controller('/auth'),
    __metadata("design:paramtypes", [])
], AuthController);
export { AuthController };
