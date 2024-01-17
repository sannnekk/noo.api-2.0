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
import { CourseService } from './Services/CourseService';
import { Asserts, Context } from '@core';
import { CourseValidator } from './CourseValidator';
import { StatusCodes } from 'http-status-codes';
let CourseController = class CourseController {
    courseService;
    courseValidator;
    constructor() {
        this.courseService = new CourseService();
        this.courseValidator = new CourseValidator();
    }
    async get(context) {
        try {
            this.courseValidator.validatePagination(context.query);
            Asserts.isAuthenticated(context);
            const courses = await this.courseService.get(context.query, context.credentials.userId, context.credentials.role);
            return new ControllerResponse(courses, StatusCodes.OK);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async getBySlug(context) {
        try {
            this.courseValidator.validateSlug(context.params.slug);
            Asserts.isAuthenticated(context);
            const course = await this.courseService.getBySlug(context.params.slug);
            return new ControllerResponse(course, StatusCodes.OK);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async getAssignedWork(context) {
        try {
            this.courseValidator.validateSlug(context.params.slug);
            Asserts.isAuthenticated(context);
            Asserts.student(context);
            const assignedWork = await this.courseService.getAssignedWorkToMaterial(context.params.slug, context.credentials.userId);
            return new ControllerResponse(assignedWork, StatusCodes.OK);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async create(context) {
        try {
            this.courseValidator.validateCreation(context.body);
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const course = await this.courseService.create(context.body, context.credentials.userId);
            return new ControllerResponse(course, StatusCodes.CREATED);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async update(context) {
        try {
            this.courseValidator.validateUpdate(context.body);
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const course = await this.courseService.update(context.body);
            return new ControllerResponse(course, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(error, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async assignWorkToMaterial(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.courseValidator.validateSlug(context.params.materialSlug);
            this.courseValidator.validateId(context.params.workId);
            await this.courseService.assignWorkToMaterial(context.params.materialSlug, context.params.workId);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async assignStudents(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.courseValidator.validateSlug(context.params.courseSlug);
            this.courseValidator.validateStudentIds(context.body);
            await this.courseService.assignStudents(context.params.courseSlug, context.body.studentIds);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async delete(context) {
        try {
            this.courseValidator.validateId(context.params.id);
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            await this.courseService.delete(context.params.id);
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
], CourseController.prototype, "get", null);
__decorate([
    Get('/:slug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getBySlug", null);
__decorate([
    Get('/material/:slug/assigned-work'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getAssignedWork", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "create", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "update", null);
__decorate([
    Patch('/:materialSlug/assign-work/:workId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "assignWorkToMaterial", null);
__decorate([
    Patch('/:courseSlug/assign-students'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "assignStudents", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "delete", null);
CourseController = __decorate([
    Controller('/course'),
    __metadata("design:paramtypes", [])
], CourseController);
export { CourseController };
