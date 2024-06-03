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
import { CourseService } from './Services/CourseService.js';
import * as Asserts from '../core/Security/asserts.js';
import { Context } from '../Core/Request/Context.js';
import { CourseValidator } from './CourseValidator.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
let CourseController = class CourseController {
    courseService;
    courseValidator;
    constructor() {
        this.courseService = new CourseService();
        this.courseValidator = new CourseValidator();
    }
    async get(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.courseValidator.parsePagination(context.query);
            const { courses, meta } = await this.courseService.get(pagination, context.credentials.userId, context.credentials.role);
            return new ApiResponse({ data: courses, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getBySlug(context) {
        try {
            await Asserts.isAuthenticated(context);
            const courseSlug = this.courseValidator.parseSlug(context.params.slug);
            const course = await this.courseService.getBySlug(courseSlug);
            if (context.credentials.role === 'student' ||
                context.credentials.role == 'mentor') {
                course.studentIds = [];
            }
            return new ApiResponse({ data: course });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getAssignedWork(context) {
        try {
            const materialSlug = this.courseValidator.parseSlug(context.params.slug);
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const assignedWork = await this.courseService.getAssignedWorkToMaterial(materialSlug, context.credentials.userId);
            return new ApiResponse({ data: assignedWork });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async create(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const courseCreationOptions = this.courseValidator.parseCreation(context.body);
            await this.courseService.create(courseCreationOptions, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async update(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const courseId = this.courseValidator.parseId(context.params.id);
            const updateCourseOptions = this.courseValidator.parseUpdate(context.body);
            await this.courseService.update(courseId, updateCourseOptions);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async assignWorkToMaterial(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const materialSlug = this.courseValidator.parseSlug(context.params.materialSlug);
            const workId = this.courseValidator.parseId(context.params.workId);
            const assignWorkOptions = this.courseValidator.parseAssignWorkOptions(context.body);
            await this.courseService.assignWorkToMaterial(materialSlug, workId, assignWorkOptions.solveDeadline, assignWorkOptions.checkDeadline);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async assignStudents(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const courseSlug = this.courseValidator.parseSlug(context.params.courseSlug);
            const studentIds = this.courseValidator.parseStudentIds(context.body);
            await this.courseService.assignStudents(courseSlug, studentIds);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async delete(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const courseId = this.courseValidator.parseId(context.params.id);
            await this.courseService.delete(courseId);
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
    Post('/'),
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
