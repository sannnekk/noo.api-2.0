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
import { CourseService } from './Services/CourseService.js';
import { Asserts } from '../core/index.js';
import { CourseValidator } from './CourseValidator.js';
import { getErrorData } from '../Core/Response/helpers.js';
let CourseController = class CourseController {
    courseService;
    courseValidator;
    constructor() {
        this.courseService = new CourseService();
        this.courseValidator = new CourseValidator();
    }
    async get(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            const pagination = this.courseValidator.validatePagination(context.query);
            const courses = await this.courseService.get(pagination, context.credentials.userId, context.credentials.role);
            const meta = await this.courseService.getLastRequestMeta();
            res.status(200).send({ data: courses, meta });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getBySlug(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.courseValidator.validateSlug(context.params.slug);
            Asserts.isAuthenticated(context);
            const course = await this.courseService.getBySlug(context.params.slug);
            res.status(200).send({ data: course });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getAssignedWork(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.courseValidator.validateSlug(context.params.slug);
            Asserts.isAuthenticated(context);
            Asserts.student(context);
            const assignedWork = await this.courseService.getAssignedWorkToMaterial(context.params.slug, context.credentials.userId);
            res.status(200).send({ data: assignedWork });
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
            this.courseValidator.validateCreation(context.body);
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            await this.courseService.create(context.body, context.credentials.userId);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async update(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            this.courseValidator.validateUpdate(context.body);
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            await this.courseService.update(context.body);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async assignWorkToMaterial(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.courseValidator.validateSlug(context.params.materialSlug);
            this.courseValidator.validateId(context.params.workId);
            this.courseValidator.validateAssignWork(context.body);
            await this.courseService.assignWorkToMaterial(context.params.materialSlug, context.params.workId, context.body.solveDeadline, context.body.checkDeadline);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async assignMeWorks(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            Asserts.student(context);
            this.courseValidator.validateSlug(context.params.courseSlug);
            await this.courseService.assignMeWorks(context.params.courseSlug, context.credentials.userId);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async assignStudents(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.courseValidator.validateSlug(context.params.courseSlug);
            this.courseValidator.validateStudentIds(context.body);
            await this.courseService.assignStudents(context.params.courseSlug, context.body.studentIds);
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
        try {
            this.courseValidator.validateId(context.params.id);
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            await this.courseService.delete(context.params.id);
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
], CourseController.prototype, "get", null);
__decorate([
    Get('/:slug'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getBySlug", null);
__decorate([
    Get('/material/:slug/assigned-work'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getAssignedWork", null);
__decorate([
    Post('/'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "create", null);
__decorate([
    Patch('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "update", null);
__decorate([
    Patch('/:materialSlug/assign-work/:workId'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "assignWorkToMaterial", null);
__decorate([
    Patch('/:courseSlug/assign-me-works'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "assignMeWorks", null);
__decorate([
    Patch('/:courseSlug/assign-students'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "assignStudents", null);
__decorate([
    Delete('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "delete", null);
CourseController = __decorate([
    Controller('/course'),
    __metadata("design:paramtypes", [])
], CourseController);
export { CourseController };
