var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Delete, Get, Post } from 'express-controller-decorator';
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { GoogleDocsValidator } from './GoogleDocsValidator.js';
import * as Asserts from '../Core/Security/asserts.js';
import { GoogleDocsIntegrationService } from './Services/GoogleDocsIntegrationService.js';
let GoogleDocsController = class GoogleDocsController {
    googleDocsIntegrationService;
    googleDocsValidator;
    constructor() {
        this.googleDocsIntegrationService = new GoogleDocsIntegrationService();
        this.googleDocsValidator = new GoogleDocsValidator();
    }
    async getBindings(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const pagination = this.googleDocsValidator.parsePagination(context.query);
            const { bindings, meta } = await this.googleDocsIntegrationService.getBindings(pagination);
            return new ApiResponse({ data: bindings, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async createBinding(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const data = this.googleDocsValidator.parseGoogleDocsBinding(context.body);
            await this.googleDocsIntegrationService.createBinding(data);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async deleteBinding(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.googleDocsValidator.parseId(context.params.id);
            await this.googleDocsIntegrationService.deleteBinding(id);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Get('/binding'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], GoogleDocsController.prototype, "getBindings", null);
__decorate([
    Post('/binding'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], GoogleDocsController.prototype, "createBinding", null);
__decorate([
    Delete('/binding/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], GoogleDocsController.prototype, "deleteBinding", null);
GoogleDocsController = __decorate([
    Controller('/google-docs'),
    __metadata("design:paramtypes", [])
], GoogleDocsController);
export { GoogleDocsController };
