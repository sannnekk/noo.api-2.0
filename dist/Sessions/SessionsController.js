var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Delete, Get } from 'express-controller-decorator';
import { SessionService } from './Services/SessionService.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { Context } from '../Core/Request/Context.js';
import * as Asserts from '../Core/Security/asserts.js';
import { SessionValidator } from './SessionValidator.js';
let SessionController = class SessionController {
    sessionService;
    sessionValidator;
    constructor() {
        this.sessionService = new SessionService();
        this.sessionValidator = new SessionValidator();
    }
    async getSessionsForUser(context) {
        try {
            await Asserts.isAuthenticated(context);
            const sessions = await this.sessionService.getSessionsForUser(context);
            return new ApiResponse({ data: sessions });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteCurrentSession(context) {
        try {
            await Asserts.isAuthenticated(context);
            await this.sessionService.deleteCurrentSession(context);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteSession(context) {
        try {
            await Asserts.isAuthenticated(context);
            const sessionId = this.sessionValidator.parseId(context.params.id);
            await this.sessionService.deleteSession(sessionId, context.credentials.userId);
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
], SessionController.prototype, "getSessionsForUser", null);
__decorate([
    Delete(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "deleteCurrentSession", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "deleteSession", null);
SessionController = __decorate([
    Controller('/session'),
    __metadata("design:paramtypes", [])
], SessionController);
export { SessionController };
