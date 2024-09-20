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
import * as Asserts from '../Core/Security/asserts.js';
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { CourseValidator } from './CourseValidator.js';
import { CourseService } from './Services/CourseService.js';
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
            Asserts.notStudent(context);
            const pagination = this.courseValidator.parsePagination(context.query);
            const { entities, meta } = await this.courseService.get(pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getStudentCourses(context) {
        try {
            await Asserts.isAuthenticated(context);
            const studentId = this.courseValidator.parseOptionalId(context.params.studentId) ||
                context.credentials.userId;
            const pagination = this.courseValidator.parsePagination(context.query);
            if (context.credentials.role === 'student') {
                Asserts.isAuthorized(context, studentId);
            }
            const { entities: courseAssignments, meta } = await this.courseService.getStudentCourseAssignments(studentId, pagination);
            return new ApiResponse({ data: courseAssignments, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async archive(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const assignmentId = this.courseValidator.parseSlug(context.params.assignmentId);
            await this.courseService.archive(assignmentId, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async unarchive(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const assignmentId = this.courseValidator.parseSlug(context.params.assignmentId);
            await this.courseService.unarchive(assignmentId, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getBySlug(context) {
        try {
            await Asserts.isAuthenticated(context);
            const courseSlug = this.courseValidator.parseSlug(context.params.slug);
            const course = await this.courseService.getBySlug(courseSlug, context.credentials.role);
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
    async createChapter(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const courseSlug = this.courseValidator.parseSlug(context.params.courseSlug);
            const chapter = this.courseValidator.parseChapterCreation(context.body);
            await this.courseService.createChapter(courseSlug, chapter);
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
    async unassignWorkFromMaterial(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const materialSlug = this.courseValidator.parseSlug(context.params.materialSlug);
            await this.courseService.unassignWorkFromMaterial(materialSlug);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getStudentList(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const courseId = this.courseValidator.parseId(context.params.courseId);
            const pagination = this.courseValidator.parsePagination(context.query);
            const { entities, meta } = await this.courseService.getStudentListWithAssignments(courseId, pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async addStudents(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const courseSlug = this.courseValidator.parseSlug(context.params.courseSlug);
            const { studentIds } = this.courseValidator.parseStudentIds(context.body);
            await this.courseService.addStudents(courseSlug, studentIds, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async removeStudents(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const courseSlug = this.courseValidator.parseSlug(context.params.courseSlug);
            const { studentIds } = this.courseValidator.parseStudentIds(context.body);
            await this.courseService.removeStudents(courseSlug, studentIds);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async addStudentsViaEmails(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const courseSlug = this.courseValidator.parseSlug(context.params.courseSlug);
            const { emails } = this.courseValidator.parseEmails(context.body);
            await this.courseService.addStudentsViaEmails(courseSlug, emails, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async removeStudentsViaEmails(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const courseSlug = this.courseValidator.parseSlug(context.params.courseSlug);
            const { emails } = this.courseValidator.parseEmails(context.body);
            await this.courseService.removeStudentsViaEmails(courseSlug, emails);
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
    Get('/student/:studentId?'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getStudentCourses", null);
__decorate([
    Patch('/:assignmentId/archive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "archive", null);
__decorate([
    Patch('/:assignmentId/unarchive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "unarchive", null);
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
    Post('/:courseSlug/chapter'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "createChapter", null);
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
    Patch('/:materialSlug/unassign-work'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "unassignWorkFromMaterial", null);
__decorate([
    Get('/:courseId/student-list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getStudentList", null);
__decorate([
    Patch('/:courseSlug/add-students'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "addStudents", null);
__decorate([
    Patch('/:courseSlug/remove-students'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "removeStudents", null);
__decorate([
    Patch('/:courseSlug/add-students-via-emails'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "addStudentsViaEmails", null);
__decorate([
    Patch('/:courseSlug/remove-students-via-emails'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "removeStudentsViaEmails", null);
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
