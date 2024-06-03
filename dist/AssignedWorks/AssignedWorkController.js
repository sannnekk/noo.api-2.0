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
import { AssignedWorkValidator } from './AssignedWorkValidator.js';
import { AssignedWorkService } from './Services/AssignedWorkService.js';
import * as Asserts from '../core/Security/asserts.js';
import { Context } from '../core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { AssignedWorkOptions } from './AssignedWorkOptions.js';
let AssignedWorkController = class AssignedWorkController {
    assignedWorkService;
    assignedWorkValidator;
    constructor() {
        this.assignedWorkService = new AssignedWorkService();
        this.assignedWorkValidator = new AssignedWorkValidator();
    }
    async get(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.assignedWorkValidator.parsePagination(context.query);
            const { assignedWorks, meta } = await this.assignedWorkService.getWorks(context.credentials.userId, context.credentials.role, pagination);
            return new ApiResponse({ data: assignedWorks, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getOne(context) {
        try {
            await Asserts.isAuthenticated(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const work = await this.assignedWorkService.getWorkById(workId, context.credentials.role);
            if (context.credentials.role == 'student') {
                Asserts.isAuthorized(context, work.studentId);
            }
            return new ApiResponse({ data: work });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async create(context) {
        try {
            await Asserts.isAuthenticated(context);
            const options = this.assignedWorkValidator.parseCreation(context.body);
            await this.assignedWorkService.createWork(options);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async remake(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const options = this.assignedWorkValidator.parseRemake(context.body);
            await this.assignedWorkService.remakeWork(workId, context.credentials.userId, options);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getOrCreate(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const materialSlug = this.assignedWorkValidator.parseSlug(context.params.materialSlug);
            const { link } = await this.assignedWorkService.getOrCreateWork(materialSlug, context.credentials.userId);
            return new ApiResponse({ data: { link } });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async solve(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const options = this.assignedWorkValidator.parseSolve(context.body);
            await this.assignedWorkService.solveWork(workId, options, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async check(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const checkOptions = this.assignedWorkValidator.parseCheck(context.body);
            await this.assignedWorkService.checkWork(workId, checkOptions);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async save(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const saveOptions = this.assignedWorkValidator.parseSave(context.body);
            await this.assignedWorkService.saveProgress(workId, saveOptions, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async archive(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.archiveWork(workId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async transfer(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const workId = this.assignedWorkValidator.parseId(context.params.workId);
            const mentorId = this.assignedWorkValidator.parseId(context.params.mentorId);
            await this.assignedWorkService.transferWorkToAnotherMentor(workId, mentorId, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async shiftDeadline(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.shiftDeadline(workId, AssignedWorkOptions.deadlineShift, context.credentials.role, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async delete(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.deleteWork(workId, context.credentials.id);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "get", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "getOne", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "create", null);
__decorate([
    Post('/:id/remake'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "remake", null);
__decorate([
    Post('/:materialSlug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "getOrCreate", null);
__decorate([
    Patch('/:id/solve'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "solve", null);
__decorate([
    Patch('/:id/check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "check", null);
__decorate([
    Patch('/:id/save'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "save", null);
__decorate([
    Patch('/:id/archive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "archive", null);
__decorate([
    Patch('/:workId/transfer/:mentorId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "transfer", null);
__decorate([
    Patch('/:id/shift-deadline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "shiftDeadline", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "delete", null);
AssignedWorkController = __decorate([
    Controller('/assigned-work'),
    __metadata("design:paramtypes", [])
], AssignedWorkController);
export { AssignedWorkController };
