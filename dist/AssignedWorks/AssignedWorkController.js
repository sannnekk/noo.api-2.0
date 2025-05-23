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
import { AssignedWorkService } from './Services/AssignedWorkService.js';
import { AssignedWorkValidator } from './AssignedWorkValidator.js';
import { FavouriteTaskService } from './Services/FavouriteTaskService.js';
let AssignedWorkController = class AssignedWorkController {
    favouriteTaskService;
    assignedWorkService;
    assignedWorkValidator;
    constructor() {
        this.assignedWorkService = new AssignedWorkService();
        this.favouriteTaskService = new FavouriteTaskService();
        this.assignedWorkValidator = new AssignedWorkValidator();
    }
    async get(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.assignedWorkValidator.parsePagination(context.query);
            const { entities, meta } = await this.assignedWorkService.getWorks(context.credentials.userId, context.credentials.role, pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getFromUser(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const userId = this.assignedWorkValidator.parseId(context.params.userId);
            const pagination = this.assignedWorkValidator.parsePagination(context.query);
            const { entities, meta } = await this.assignedWorkService.getWorks(userId, undefined, pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getOne(context) {
        try {
            await Asserts.isAuthenticated(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const work = await this.assignedWorkService.getWorkById(workId, context.credentials.role);
            if (context.credentials.role === 'student') {
                Asserts.isAuthorized(context, work.studentId);
            }
            if (context.credentials.role === 'mentor' && work.work.type !== 'test') {
                Asserts.isAuthorized(context, work.mentorIds);
            }
            return new ApiResponse({ data: work });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getProgressByWorkId(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const workId = this.assignedWorkValidator.parseId(context.params.workId);
            const progress = await this.assignedWorkService.getProgressByWorkId(workId, context.credentials.userId);
            return new ApiResponse({ data: progress });
        }
        catch (error) {
            return new ApiResponse(error, context);
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
            return new ApiResponse(error, context);
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
            return new ApiResponse(error, context);
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
            return new ApiResponse(error, context);
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
            return new ApiResponse(error, context);
        }
    }
    async check(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const checkOptions = this.assignedWorkValidator.parseCheck(context.body);
            await this.assignedWorkService.checkWork(workId, checkOptions, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async recheсkAutomatically(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.recheckAutomatically(workId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async save(context) {
        try {
            await Asserts.isAuthenticated(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const saveOptions = this.assignedWorkValidator.parseSave(context.body);
            await this.assignedWorkService.saveProgress(workId, saveOptions, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async saveWorkComments(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const comments = this.assignedWorkValidator.parseWorkComments(context.body);
            await this.assignedWorkService.saveWorkComments(workId, comments, context.credentials.userId, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async saveAnswer(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudentOrAssistant(context);
            const assignedWorkId = this.assignedWorkValidator.parseId(context.params.id);
            const answer = this.assignedWorkValidator.parseAnswer(context.body);
            const answerId = await this.assignedWorkService.saveAnswer(assignedWorkId, answer, context.credentials.userId, context.credentials.role);
            return new ApiResponse({ data: answerId });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async saveComment(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const assignedWorkId = this.assignedWorkValidator.parseId(context.params.id);
            const comment = this.assignedWorkValidator.parseComment(context.body);
            const commentId = await this.assignedWorkService.saveComment(assignedWorkId, comment, context.credentials.userId);
            return new ApiResponse({ data: commentId });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getFavourites(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const subjectId = this.assignedWorkValidator.parseId(context.params.subjectId);
            const count = this.assignedWorkValidator.parseInt(context.params.count);
            const { entities, meta } = await this.favouriteTaskService.getFavouriteTasks(context.credentials.userId, subjectId, count);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async isFavourite(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const taskId = this.assignedWorkValidator.parseId(context.params.taskId);
            const isFavourite = await this.favouriteTaskService.isTaskFavourite(context.credentials.userId, taskId);
            return new ApiResponse({ data: isFavourite });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async addToFavourites(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const taskId = this.assignedWorkValidator.parseId(context.params.taskId);
            await this.favouriteTaskService.addTaskToFavourites(context.credentials.userId, taskId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async removeFromFavourites(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const taskId = this.assignedWorkValidator.parseId(context.params.taskId);
            await this.favouriteTaskService.removeFavouriteTask(context.credentials.userId, taskId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async bulkRemoveFromFavourites(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.student(context);
            const payload = this.assignedWorkValidator.parseBulkFavouriteTasksRemove(context.body);
            await this.favouriteTaskService.bulkRemoveFavouriteTasks(context.credentials.userId, payload.ids);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async archive(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudentOrAssistant(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.archiveWork(workId, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async unarchive(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudentOrAssistant(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.unarchiveWork(workId, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
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
            return new ApiResponse(error, context);
        }
    }
    async replaceMentor(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdminOrAssistant(context);
            const workId = this.assignedWorkValidator.parseId(context.params.workId);
            const mentorId = this.assignedWorkValidator.parseId(context.params.mentorId);
            await this.assignedWorkService.replaceMentor(workId, mentorId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async shiftDeadline(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            const newDeadlines = await this.assignedWorkService.shiftDeadline(workId, context.credentials.role, context.credentials.userId);
            return new ApiResponse({ data: newDeadlines });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async sendToRevision(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.sendToRevision(workId, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async sendToRecheck(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const assignedWorkId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.sendToRecheck(assignedWorkId, context.credentials.userId, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async delete(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            const workId = this.assignedWorkValidator.parseId(context.params.id);
            await this.assignedWorkService.deleteWork(workId, context.credentials.userId, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
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
    Get('/from-user/:userId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "getFromUser", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "getOne", null);
__decorate([
    Get('/progress/:workId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "getProgressByWorkId", null);
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
    Patch('/:id/recheck-automatically'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "reche\u0441kAutomatically", null);
__decorate([
    Patch('/:id/save'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "save", null);
__decorate([
    Patch('/:id/save-work-comments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "saveWorkComments", null);
__decorate([
    Patch('/:id/save-answer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "saveAnswer", null);
__decorate([
    Patch('/:id/save-comment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "saveComment", null);
__decorate([
    Get('/task/favourites/:subjectId/:count?'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "getFavourites", null);
__decorate([
    Get('/task/:taskId/is-favourite'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "isFavourite", null);
__decorate([
    Post('/task/:taskId/add-to-favourites'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "addToFavourites", null);
__decorate([
    Delete('/task/:taskId/remove-from-favourites'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "removeFromFavourites", null);
__decorate([
    Post('/task/bulk/favourites/remove'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "bulkRemoveFromFavourites", null);
__decorate([
    Patch('/:id/archive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "archive", null);
__decorate([
    Patch('/:id/unarchive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "unarchive", null);
__decorate([
    Patch('/:workId/transfer/:mentorId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "transfer", null);
__decorate([
    Patch('/:workId/replace-mentor/:mentorId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "replaceMentor", null);
__decorate([
    Patch('/:id/shift-deadline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "shiftDeadline", null);
__decorate([
    Patch('/:id/send-to-revision'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "sendToRevision", null);
__decorate([
    Patch('/:id/send-to-recheck'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], AssignedWorkController.prototype, "sendToRecheck", null);
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
