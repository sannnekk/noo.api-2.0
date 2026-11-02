var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Delete, Post } from 'express-controller-decorator';
import * as Asserts from '../Core/Security/asserts.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { Context } from '../Core/Request/Context.js';
import { ShpuntikService } from './Services/ShpuntikService.js';
import { ShpuntikValidator } from './ShpuntikValidator.js';
let ShpuntikController = class ShpuntikController {
    shpuntikService;
    shpuntikValidator;
    constructor() {
        this.shpuntikService = new ShpuntikService();
        this.shpuntikValidator = new ShpuntikValidator();
    }
    async checkTask(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const workId = this.shpuntikValidator.parseId(context.params.workId);
            const taskId = this.shpuntikValidator.parseId(context.params.taskId);
            await this.shpuntikService.checkTask(workId, taskId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async removeComment(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const workId = this.shpuntikValidator.parseId(context.params.workId);
            const taskId = this.shpuntikValidator.parseId(context.params.taskId);
            await this.shpuntikService.removeComment(workId, taskId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
};
__decorate([
    Post('/check/:workId/:taskId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], ShpuntikController.prototype, "checkTask", null);
__decorate([
    Delete('/comment/:workId/:taskId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], ShpuntikController.prototype, "removeComment", null);
ShpuntikController = __decorate([
    Controller('/shpuntik'),
    __metadata("design:paramtypes", [])
], ShpuntikController);
export { ShpuntikController };
