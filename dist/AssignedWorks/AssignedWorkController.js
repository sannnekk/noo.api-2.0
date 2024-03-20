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
import { Controller, Delete, Get, Patch, Post, Req, Res, } from '@decorators/express';
import { AssignedWorkValidator } from './AssignedWorkValidator.js';
import { AssignedWorkService } from './Services/AssignedWorkService.js';
import * as Asserts from '../core/Security/asserts.js';
import { getErrorData } from '../core/Response/helpers.js';
let AssignedWorkController = class AssignedWorkController {
    assignedWorkService;
    assignedWorkValidator;
    constructor() {
        this.assignedWorkService = new AssignedWorkService();
        this.assignedWorkValidator = new AssignedWorkValidator();
    }
    async get(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            const pagination = this.assignedWorkValidator.validatePagination(context.query);
            const works = await this.assignedWorkService.getWorks(context.credentials.userId, context.credentials.role, pagination);
            const meta = await this.assignedWorkService.getLastRequestMeta();
            res.status(200).send({ data: works, meta });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getOne(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            this.assignedWorkValidator.validateId(context.params.id);
            const work = await this.assignedWorkService.getWorkById(context.params.id);
            if (context.credentials.role == 'student') {
                Asserts.isAuthorized(context, work.studentId);
                if (work && work.checkStatus === 'in-progress') {
                    work.comments = [];
                }
            }
            else {
                Asserts.isAuthorized(context, work.mentorIds);
            }
            res.status(200).send({ data: work });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async create(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.assignedWorkValidator.validateCreation(context.body);
            await this.assignedWorkService.createWork(context.body);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async solve(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            Asserts.student(context);
            this.assignedWorkValidator.validateId(context.params.id);
            this.assignedWorkValidator.validateUpdate(context.body);
            await this.assignedWorkService.solveWork(context.body);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async check(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.id);
            this.assignedWorkValidator.validateUpdate(context.body);
            await this.assignedWorkService.checkWork(context.body);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async save(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            this.assignedWorkValidator.validateId(context.params.id);
            this.assignedWorkValidator.validateUpdate(context.body);
            await this.assignedWorkService.saveProgress(context.body, context.credentials.role);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async archive(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.id);
            await this.assignedWorkService.archiveWork(context.params.id);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async transfer(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.workId);
            this.assignedWorkValidator.validateId(context.params.mentorId);
            await this.assignedWorkService.transferWorkToAnotherMentor(context.params.workId, context.params.mentorId, context.credentials.userId);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async shiftDeadline(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            this.assignedWorkValidator.validateId(context.params.id);
            await this.assignedWorkService.shiftDeadline(context.params.id, 1, context.credentials.role, context.credentials.userId);
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
            Asserts.mentor(context);
            this.assignedWorkValidator.validateId(context.params.id);
            await this.assignedWorkService.deleteWork(context.params.id, context.credentials.id);
            res.status(200).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
};
__decorate([
    Get('/'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "get", null);
__decorate([
    Get('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "getOne", null);
__decorate([
    Post('/'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "create", null);
__decorate([
    Patch('/:id/solve'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "solve", null);
__decorate([
    Patch('/:id/check'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "check", null);
__decorate([
    Patch('/:id/save'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "save", null);
__decorate([
    Patch('/:id/archive'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "archive", null);
__decorate([
    Patch('/:workId/transfer/:mentorId'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "transfer", null);
__decorate([
    Patch('/:id/shift-deadline'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "shiftDeadline", null);
__decorate([
    Delete('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "delete", null);
AssignedWorkController = __decorate([
    Controller('/assigned-work'),
    __metadata("design:paramtypes", [])
], AssignedWorkController);
export { AssignedWorkController };
