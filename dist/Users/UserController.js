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
import { Controller, Delete, Get, Patch } from 'express-controller-decorator';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { UserValidator } from './UserValidator.js';
import { UserService } from './Services/UserService.js';
import { UserSettingsService } from '../UserSettings/Services/UserSettingsService.js';
let UserController = class UserController {
    userValidator;
    userService;
    userSettingsService;
    constructor() {
        this.userValidator = new UserValidator();
        this.userService = new UserService();
        this.userSettingsService = new UserSettingsService();
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
            const username = this.userValidator.parseNonemptyString(context.params.username);
            await this.userService.verifyManual(username);
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
            const { entities, meta } = await this.userService.getMentors(pagination);
            return new ApiResponse({ data: entities, meta });
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
            const { entities, meta } = await this.userService.getTeachers(pagination);
            return new ApiResponse({ data: entities, meta });
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
            const { entities, meta } = await this.userService.getStudents(pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getMyStudents(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const pagination = this.userValidator.parsePagination(context.query);
            const mentorId = this.userValidator.parseOptionalId(context.params.mentorId);
            const { entities, meta } = await this.userService.getStudentsOf(mentorId || context.credentials.userId, pagination);
            return new ApiResponse({ data: entities, meta });
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
            const { entities, meta } = await this.userService.getUsers(pagination);
            return new ApiResponse({ data: entities, meta });
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
            }
            await this.userService.update(id, updateUserDTO);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async updatePassword(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.userValidator.parseId(context.params.id);
            const updatePasswordDTO = this.userValidator.parseUpdatePassword(context.body);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, id);
            }
            await this.userService.changePassword(id, updatePasswordDTO, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async updateRole(context) {
        try {
            await Asserts.isAuthenticated(context);
            await Asserts.teacherOrAdmin(context);
            const id = this.userValidator.parseId(context.params.id);
            const { role } = this.userValidator.parseRole(context.body);
            await this.userService.changeRole(id, role);
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
    async block(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.userValidator.parseId(context.params.id);
            await this.userService.block(id);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async unblock(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.userValidator.parseId(context.params.id);
            await this.userService.unblock(id);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async assignMentor(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const studentId = this.userValidator.parseId(context.params.studentId);
            const mentorId = this.userValidator.parseId(context.params.mentorId);
            const subjectId = this.userValidator.parseId(context.params.subjectId);
            await this.userService.assignMentor(studentId, mentorId, subjectId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async unassignMentor(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const studentId = this.userValidator.parseId(context.params.studentId);
            const subjectId = this.userValidator.parseId(context.params.subjectId);
            await this.userService.unassignMentor(studentId, subjectId);
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
            const password = this.userValidator.parseNonemptyString(context.params.password);
            if (!['admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, id);
            }
            await this.userService.delete(id, password);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
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
    Get('/student/search/own/:mentorId?'),
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
    Patch('/:id/password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updatePassword", null);
__decorate([
    Patch('/:id/role'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateRole", null);
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
    Patch('/:id/block'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "block", null);
__decorate([
    Patch('/:id/unblock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "unblock", null);
__decorate([
    Patch('/:studentId/:subjectId/mentor/:mentorId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "assignMentor", null);
__decorate([
    Delete('/:studentId/:subjectId/mentor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "unassignMentor", null);
__decorate([
    Delete('/:id/:password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delete", null);
UserController = __decorate([
    Controller('/user'),
    __metadata("design:paramtypes", [])
], UserController);
export { UserController };
