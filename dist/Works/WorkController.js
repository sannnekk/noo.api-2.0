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
import { WorkService } from './Services/WorkService.js';
import { WorkValidator } from './WorkValidator.js';
import * as Asserts from '../Core/Security/asserts.js';
import { getErrorData } from '../Core/Response/helpers.js';
import { Req, Res, Controller, Delete, Get, Patch, Post, } from '@decorators/express';
let WorkController = class WorkController {
    workService;
    workValidator;
    constructor() {
        this.workService = new WorkService();
        this.workValidator = new WorkValidator();
    }
    async getWorks(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const pagination = this.workValidator.validatePagination(context.query);
            const { works, meta } = await this.workService.getWorks(pagination);
            res.status(200).send({ data: works, meta });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getWorkBySlug(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            await Asserts.isAuthenticated(context);
            this.workValidator.validateSlug(context.params.slug);
            const work = await this.workService.getWorkBySlug(context.params.slug);
            res.status(200).send({ data: work });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async createWork(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.workValidator.validateCreation(context.body);
            await this.workService.createWork(context.body);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async copyWork(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.workValidator.validateSlug(context.params.slug);
            await this.workService.copyWork(context.params.slug);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async updateWork(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.workValidator.validateUpdate(context.body);
            this.workValidator.validateId(context.params.id);
            await this.workService.updateWork(context.body);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async deleteWork(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            this.workValidator.validateId(context.params.id);
            await this.workService.deleteWork(context.params.id);
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
], WorkController.prototype, "getWorks", null);
__decorate([
    Get('/:slug'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getWorkBySlug", null);
__decorate([
    Post('/'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "createWork", null);
__decorate([
    Post('/copy/:slug'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "copyWork", null);
__decorate([
    Patch('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "updateWork", null);
__decorate([
    Delete('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "deleteWork", null);
WorkController = __decorate([
    Controller('/work'),
    __metadata("design:paramtypes", [])
], WorkController);
export { WorkController };
