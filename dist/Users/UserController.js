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
import * as Asserts from '../Core/Security/asserts.js';
import { Controller, Delete, Get, Patch, Post, } from 'express-controller-decorator';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { UserValidator } from './UserValidator.js';
import { UserService } from './Services/UserService.js';
import { AuthService } from './Services/AuthService.js';
import { SessionService } from '../Sessions/Services/SessionService.js';
let UserController = class UserController {
    userValidator;
    userService;
    authService;
    sessionService;
    constructor() {
        this.userValidator = new UserValidator();
        this.userService = new UserService();
        this.authService = new AuthService();
        this.sessionService = new SessionService();
    }
    async login(context) {
        try {
            const loginDTO = this.userValidator.parseLogin(context.body);
            const payload = await this.authService.login(loginDTO, context);
            return new ApiResponse({ data: payload });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async register(context) {
        try {
            const registerDTO = this.userValidator.parseRegister(context.body);
            await this.authService.register(registerDTO);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async checkUsername(context) {
        try {
            const username = this.userValidator.parseSlug(context.params.username);
            const exists = await this.authService.checkUsername(username);
            return new ApiResponse({ data: { exists } });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async resendVerification(context) {
        try {
            const resendVerificationDTO = this.userValidator.parseResendVerification(context.body);
            await this.authService.resendVerification(resendVerificationDTO.email);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async verify(context) {
        try {
            const verificationDTO = this.userValidator.parseVerification(context.body);
            await this.authService.verify(verificationDTO.username, verificationDTO.token);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async verifyEmailChange(context) {
        try {
            const emailChangeVerificationDTO = this.userValidator.parseEmailChangeVerification(context.body);
            await this.userService.confirmEmailUpdate(emailChangeVerificationDTO.username, emailChangeVerificationDTO.token);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async forgotPassword(context) {
        try {
            const forgotPasswordDTO = this.userValidator.validateForgotPassword(context.body);
            await this.authService.forgotPassword(forgotPasswordDTO.email);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getByUsername(context) {
        try {
            await Asserts.isAuthenticated(context);
            const username = this.userValidator.parseSlug(context.params.username);
            const user = await this.userService.getByUsername(username);
            return new ApiResponse({ data: user });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async verifyManual(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const username = this.userValidator.parseSlug(context.params.username);
            await this.authService.verifyManual(username);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getMentors(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.parsePagination(context.query);
            const { mentors, meta } = await this.userService.getMentors(pagination);
            return new ApiResponse({ data: mentors, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getTeachers(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.parsePagination(context.query);
            const { teachers, meta } = await this.userService.getTeachers(pagination);
            return new ApiResponse({ data: teachers, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getStudents(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.parsePagination(context.query);
            const { students, meta } = await this.userService.getStudents(pagination);
            return new ApiResponse({ data: students, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getMyStudents(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const pagination = this.userValidator.parsePagination(context.query);
            const { students, meta } = await this.userService.getStudentsOf(context.credentials.userId, pagination);
            return new ApiResponse({ data: students, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getUsers(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.parsePagination(context.query);
            const { users, meta } = await this.userService.getUsers(pagination);
            return new ApiResponse({ data: users, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async update(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.userValidator.parseId(context.params.id);
            const updateUserDTO = this.userValidator.parseUpdate(context.body);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, id);
                updateUserDTO.role = undefined;
            }
            await this.userService.update(id, updateUserDTO, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async updateTelegram(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.userValidator.parseId(context.params.id);
            const updateTelegramDTO = this.userValidator.parseTelegramUpdate(context.body);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, id);
            }
            await this.userService.updateTelegram(id, updateTelegramDTO);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async updateEmail(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.userValidator.parseId(context.params.id);
            const updateEmailDTO = this.userValidator.parseEmailUpdate(context.body);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, id);
            }
            await this.userService.sendEmailUpdate(id, updateEmailDTO.email);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async assignMentor(context) {
        try {
            Asserts.notStudent(context);
            const studentId = this.userValidator.parseId(context.params.studentId);
            const mentorId = this.userValidator.parseId(context.params.mentorId);
            await this.userService.assignMentor(studentId, mentorId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async delete(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.userValidator.parseId(context.params.id);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, id);
            }
            await this.userService.delete(id);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Post('/auth/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    Post('/auth/register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    Get('/auth/check-username/:username'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "checkUsername", null);
__decorate([
    Post('/auth/resend-verification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resendVerification", null);
__decorate([
    Patch('/auth/verify'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verify", null);
__decorate([
    Patch('/auth/verify-email-change'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verifyEmailChange", null);
__decorate([
    Post('/auth/forgot-password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "forgotPassword", null);
__decorate([
    Get('/:username'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getByUsername", null);
__decorate([
    Patch('/:username/verify-manual'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verifyManual", null);
__decorate([
    Get('/mentor/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMentors", null);
__decorate([
    Get('/teacher/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getTeachers", null);
__decorate([
    Get('/student/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getStudents", null);
__decorate([
    Get('/student/search/own'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyStudents", null);
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    Patch('/:id/telegram'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateTelegram", null);
__decorate([
    Patch('/:id/email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateEmail", null);
__decorate([
    Patch('/:studentId/assign-mentor/:mentorId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "assignMentor", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delete", null);
UserController = __decorate([
    Controller('/user'),
    __metadata("design:paramtypes", [])
], UserController);
export { UserController };
