var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, ControllerResponse, Delete, Get, Patch, Post, } from 'express-controller-decorator';
import { AssignedWorkValidator } from './AssignedWorkValidator.js';
import { AssignedWorkService } from './Services/AssignedWorkService.js';
import { Asserts, Context } from '../core/index.js';
import { StatusCodes } from 'http-status-codes';
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
            this.assignedWorkValidator.validatePagination(context.query);
            const works = await this.assignedWorkService.getWorks(context.credentials.userId, context.credentials.role, context.query);
            return new ControllerResponse(works, StatusCodes.OK);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
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
            return new ControllerResponse(work, StatusCodes.OK);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async create(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.assignedWorkValidator.validateCreation(context.body);
            await this.assignedWorkService.createWork(context.body, context.credentials.userId);
            return new ControllerResponse(null, StatusCodes.CREATED);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async solve(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.student(context);
            this.assignedWorkValidator.validateId(context.params.id);
            this.assignedWorkValidator.validateUpdate(context.body);
            await this.assignedWorkService.solveWork(context.body);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async check(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.id);
            this.assignedWorkValidator.validateUpdate(context.body);
            await this.assignedWorkService.checkWork(context.body);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async transfer(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.workId);
            this.assignedWorkValidator.validateId(context.params.mentorId);
            await this.assignedWorkService.transferWorkToAnotherMentor(context.params.workId, context.params.mentorId);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async shiftDeadline(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            this.assignedWorkValidator.validateId(context.params.id);
            await this.assignedWorkService.shiftDeadline(context.params.id, 3, context.credentials.role, context.credentials.userId);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async delete(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.id);
            await this.assignedWorkService.deleteWork(context.params.id, context.credentials.id);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
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
