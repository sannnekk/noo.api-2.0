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
import { SnippetService } from './Service/SnippetService.js';
import { SnippetValidator } from './SnippetValidator.js';
let SnippetsController = class SnippetsController {
    snippetService;
    snippetValidator;
    constructor() {
        this.snippetService = new SnippetService();
        this.snippetValidator = new SnippetValidator();
    }
    async getSnippets(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const userId = context.credentials.userId;
            const snippets = await this.snippetService.getSnippets(userId);
            return new ApiResponse({ data: snippets });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async createSnippet(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const snippet = this.snippetValidator.parseSnippet(context.body);
            await this.snippetService.createSnippet(snippet, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async updateSnippet(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const id = this.snippetValidator.parseId(context.params.id);
            const snippet = this.snippetValidator.parseSnippet(context.body);
            await this.snippetService.updateSnippet(id, snippet, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteSnippet(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const id = this.snippetValidator.parseId(context.params.id);
            await this.snippetService.deleteSnippet(id, context.credentials.userId);
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
], SnippetsController.prototype, "getSnippets", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SnippetsController.prototype, "createSnippet", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SnippetsController.prototype, "updateSnippet", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], SnippetsController.prototype, "deleteSnippet", null);
SnippetsController = __decorate([
    Controller('/snippet'),
    __metadata("design:paramtypes", [])
], SnippetsController);
export { SnippetsController };
