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
import { WorkService } from './Services/WorkService';
import { WorkValidator } from './WorkValidator';
import { Asserts, Context } from '@core';
import { StatusCodes } from 'http-status-codes';
let WorkController = class WorkController {
    workService;
    workValidator;
    constructor() {
        this.workService = new WorkService();
        this.workValidator = new WorkValidator();
    }
    async getWorks(context) {
        try {
            Asserts.isAuthenticated(context);
            this.workValidator.validatePagination(context.query);
            const works = await this.workService.getWorks(context.query);
            return new ControllerResponse(works, StatusCodes.OK);
        }
        catch (e) {
            return new ControllerResponse(null, e.code || StatusCodes.BAD_REQUEST);
        }
    }
    async getWorkBySlug(context) {
        try {
            Asserts.isAuthenticated(context);
            this.workValidator.validateSlug(context.params.slug);
            const work = await this.workService.getWorkBySlug(context.params.slug);
            return new ControllerResponse(work, StatusCodes.OK);
        }
        catch (e) {
            return new ControllerResponse(null, e.code || StatusCodes.BAD_REQUEST);
        }
    }
    async createWork(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.workValidator.validateCreation(context.body);
            await this.workService.createWork(context.body);
            return new ControllerResponse(null, StatusCodes.CREATED);
        }
        catch (error) {
            return new ControllerResponse(error, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async updateWork(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.workValidator.validateUpdate(context.body);
            this.workValidator.validateId(context.params.id);
            await this.workService.updateWork(context.body);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (e) {
            return new ControllerResponse(null, e.code || StatusCodes.BAD_REQUEST);
        }
    }
    async deleteWork(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.workValidator.validateId(context.params.id);
            await this.workService.deleteWork(context.params.id);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (e) {
            return new ControllerResponse(null, e.code || StatusCodes.BAD_REQUEST);
        }
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getWorks", null);
__decorate([
    Get('/:slug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getWorkBySlug", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "createWork", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "updateWork", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "deleteWork", null);
WorkController = __decorate([
    Controller('/work'),
    __metadata("design:paramtypes", [])
], WorkController);
export { WorkController };
