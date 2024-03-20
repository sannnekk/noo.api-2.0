var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { UserService } from './Services/UserService.js';
import { UserValidator } from './UserValidator.js';
import * as Asserts from '../core/Security/asserts.js';
import { getErrorData } from '../core/Response/helpers.js';
import { Req, Res, Controller, Delete, Get, Patch, Post, } from '@decorators/express';
let UserController = class UserController {
    userValidator;
    userService;
    constructor() {
        this.userValidator = new UserValidator();
        this.userService = new UserService();
    }
    async create(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.userValidator.validateCreation(context.body);
            Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            await this.userService.create(context.body);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async login(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.userValidator.validateLogin(context.body);
            const payload = await this.userService.login(context.body);
            res.status(200).send({ data: payload });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async register(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.userValidator.validateRegister(context.body);
            await this.userService.register(context.body);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async resendVerification(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.userValidator.validateResendVerification(context.body);
            await this.userService.resendVerification(context.body.email);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async verify(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.userValidator.validateVerification(context.body);
            await this.userService.verify(context.body.username, context.body.token);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async forgotPassword(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.userValidator.validateForgotPassword(context.body);
            await this.userService.forgotPassword(context.body.email);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getByUsername(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateSlug(context.params.username);
            const user = await this.userService.getByUsername(context.params.username);
            res.status(200).send({ data: user });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async verifyManual(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            this.userValidator.validateSlug(context.params.username);
            await this.userService.verifyManual(context.params.username);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getMentors(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.validatePagination(context.query);
            const mentors = await this.userService.getMentors(pagination);
            const meta = await this.userService.getLastRequestMeta();
            res.status(200).send({ data: mentors, meta });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getStudents(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.validatePagination(context.query);
            const students = await this.userService.getStudents(pagination);
            const meta = await this.userService.getLastRequestMeta();
            res.status(200).send({ data: students, meta });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getMyStudents(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const pagination = this.userValidator.validatePagination(context.query);
            const students = await this.userService.getStudentsOf(context.credentials.userId, pagination);
            const meta = await this.userService.getLastRequestMeta();
            res.status(200).send({ data: students, meta });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getUsers(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.validatePagination(context.query);
            const users = await this.userService.getUsers(pagination);
            const meta = await this.userService.getLastRequestMeta();
            res.status(200).send({ data: users, meta });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async update(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateId(context.params.id);
            this.userValidator.validateUpdate(context.body);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, context.params.id);
            }
            await this.userService.update(context.body);
            res.status(200).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async assignMentor(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.notStudent(context);
            this.userValidator.validateId(context.params.studentId);
            this.userValidator.validateId(context.params.mentorId);
            await this.userService.assignMentor(context.params.studentId, context.params.mentorId);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async delete(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateId(context.params.id);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, context.params.id);
            }
            await this.userService.delete(context.params.id);
            res.status(200).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
};
__decorate([
    Post('/'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    Post('/auth/login'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    Post('/auth/register'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    Post('/auth/resend-verification'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resendVerification", null);
__decorate([
    Patch('/auth/verify'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verify", null);
__decorate([
    Post('/auth/forgot-password'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "forgotPassword", null);
__decorate([
    Get('/:username'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getByUsername", null);
__decorate([
    Patch('/:username/verify-manual'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verifyManual", null);
__decorate([
    Get('/mentor/search'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMentors", null);
__decorate([
    Get('/student/search'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getStudents", null);
__decorate([
    Get('/student/search/own'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyStudents", null);
__decorate([
    Get('/'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    Patch('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    Patch('/:studentId/assign-mentor/:mentorId'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "assignMentor", null);
__decorate([
    Delete('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delete", null);
UserController = __decorate([
    Controller('/user'),
    __metadata("design:paramtypes", [])
], UserController);
export { UserController };
