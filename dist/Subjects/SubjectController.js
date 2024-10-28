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
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { Controller, Delete, Get, Patch, Post, } from 'express-controller-decorator';
import * as Asserts from '../Core/Security/asserts.js';
import { SubjectService } from './Services/SubjectService.js';
import { SubjectValidator } from './SubjectValidator.js';
let SubjectController = class SubjectController {
    subjectService;
    subjectValidator;
    constructor() {
        this.subjectService = new SubjectService();
        this.subjectValidator = new SubjectValidator();
    }
    async getSubjects(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.subjectValidator.parsePagination(context.query);
            const { entities, meta } = await this.subjectService.getSubjects(pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async createSubject(context) {
        try {
            await Asserts.isAuthenticated(context);
            await Asserts.admin(context);
            const subject = this.subjectValidator.parseSubject(context.body);
            await this.subjectService.createSubject(subject);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async updateSubject(context) {
        try {
            await Asserts.isAuthenticated(context);
            await Asserts.admin(context);
            const id = this.subjectValidator.parseId(context.params.id);
            const subject = this.subjectValidator.parseSubject(context.body);
            await this.subjectService.updateSubject(id, subject);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteSubject(context) {
        try {
            await Asserts.isAuthenticated(context);
            await Asserts.admin(context);
            const id = this.subjectValidator.parseId(context.params.id);
            await this.subjectService.deleteSubject(id);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SubjectController.prototype, "getSubjects", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SubjectController.prototype, "createSubject", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SubjectController.prototype, "updateSubject", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SubjectController.prototype, "deleteSubject", null);
SubjectController = __decorate([
    Controller('/subject'),
    __metadata("design:paramtypes", [])
], SubjectController);
export { SubjectController };
