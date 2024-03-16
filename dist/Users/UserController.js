var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Delete, Get, Patch, Post, } from 'express-controller-decorator';
import { ApiResponse, Context } from '@core';
import { UserService } from './Services/UserService';
import { UserValidator } from './UserValidator';
import { Asserts } from '@core';
let UserController = class UserController {
    userValidator;
    userService;
    constructor() {
        this.userValidator = new UserValidator();
        this.userService = new UserService();
    }
    async create(context) {
        try {
            this.userValidator.validateCreation(context.body);
            Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            await this.userService.create(context.body);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async login(context) {
        try {
            this.userValidator.validateLogin(context.body);
            const payload = await this.userService.login(context.body);
            return new ApiResponse({ data: payload });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async register(context) {
        try {
            this.userValidator.validateRegister(context.body);
            await this.userService.register(context.body);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async resendVerification(context) {
        try {
            this.userValidator.validateResendVerification(context.body);
            await this.userService.resendVerification(context.body.email);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async verify(context) {
        try {
            this.userValidator.validateVerification(context.body);
            await this.userService.verify(context.body.username, context.body.token);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async forgotPassword(context) {
        try {
            this.userValidator.validateForgotPassword(context.body);
            await this.userService.forgotPassword(context.body.email);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getByUsername(context) {
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateSlug(context.params.username);
            const user = await this.userService.getByUsername(context.params.username);
            return new ApiResponse({ data: user });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getMentors(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.validatePagination(context.query);
            const mentors = await this.userService.getMentors(pagination);
            const meta = await this.userService.getLastRequestMeta();
            return new ApiResponse({ data: mentors, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getStudents(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.validatePagination(context.query);
            const students = await this.userService.getStudents(pagination);
            const meta = await this.userService.getLastRequestMeta();
            return new ApiResponse({ data: students, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getMyStudents(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const pagination = this.userValidator.validatePagination(context.query);
            const students = await this.userService.getStudentsOf(context.credentials.userId, pagination);
            const meta = await this.userService.getLastRequestMeta();
            return new ApiResponse({ data: students, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getUsers(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.validatePagination(context.query);
            const users = await this.userService.getUsers(pagination);
            const meta = await this.userService.getLastRequestMeta();
            return new ApiResponse({ data: users, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async update(context) {
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateId(context.params.id);
            this.userValidator.validateUpdate(context.body);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, context.params.id);
            }
            await this.userService.update(context.body);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async assignMentor(context) {
        try {
            Asserts.notStudent(context);
            this.userValidator.validateId(context.params.studentId);
            this.userValidator.validateId(context.params.mentorId);
            await this.userService.assignMentor(context.params.studentId, context.params.mentorId);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async delete(context) {
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateId(context.params.id);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, context.params.id);
            }
            await this.userService.delete(context.params.id);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
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
    Get('/mentor/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMentors", null);
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
    Get(),
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
