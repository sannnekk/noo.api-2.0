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
import { Asserts, Context, ApiResponse } from '../core/index.js';
let AssignedWorkController = class AssignedWorkController {
    assignedWorkService;
    assignedWorkValidator;
    constructor() {
        this.assignedWorkService = new AssignedWorkService();
        this.assignedWorkValidator = new AssignedWorkValidator();
    }
    async get(context) {
        try {
            Asserts.isAuthenticated(context);
            const pagination = this.assignedWorkValidator.validatePagination(context.query);
            const works = await this.assignedWorkService.getWorks(context.credentials.userId, context.credentials.role, pagination);
            const meta = await this.assignedWorkService.getLastRequestMeta();
            return new ApiResponse({ data: works, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getOne(context) {
        try {
            Asserts.isAuthenticated(context);
            this.assignedWorkValidator.validateId(context.params.id);
            const work = await this.assignedWorkService.getWorkById(context.params.id);
            if (context.credentials.role == 'student') {
                Asserts.isAuthorized(context, work.studentId);
            }
            else {
                Asserts.isAuthorized(context, work.mentorIds);
            }
            return new ApiResponse({ data: work });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async create(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.assignedWorkValidator.validateCreation(context.body);
            await this.assignedWorkService.createWork(context.body);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async solve(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.student(context);
            this.assignedWorkValidator.validateId(context.params.id);
            this.assignedWorkValidator.validateUpdate(context.body);
            const comments = await this.assignedWorkService.solveWork(context.body);
            return new ApiResponse({ data: comments });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async check(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.id);
            this.assignedWorkValidator.validateUpdate(context.body);
            await this.assignedWorkService.checkWork(context.body);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async save(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            this.assignedWorkValidator.validateId(context.params.id);
            this.assignedWorkValidator.validateUpdate(context.body);
            await this.assignedWorkService.saveProgress(context.body, context.credentials.role);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async archive(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.id);
            await this.assignedWorkService.archiveWork(context.params.id);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async transfer(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.workId);
            this.assignedWorkValidator.validateId(context.params.mentorId);
            await this.assignedWorkService.transferWorkToAnotherMentor(context.params.workId, context.params.mentorId, context.credentials.userId);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async shiftDeadline(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            this.assignedWorkValidator.validateId(context.params.id);
            await this.assignedWorkService.shiftDeadline(context.params.id, 3, context.credentials.role, context.credentials.userId);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async delete(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.id);
            await this.assignedWorkService.deleteWork(context.params.id, context.credentials.id);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Get(),
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
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "create", null);
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
