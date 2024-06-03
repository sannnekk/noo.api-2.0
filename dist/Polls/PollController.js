var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get, Patch, Post, } from 'express-controller-decorator';
import { PollValidator } from './PollValidator.js';
import { PollService } from './Services/PollService.js';
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import * as Asserts from '../Core/Security/asserts.js';
let PollController = class PollController {
    pollService;
    pollValidator;
    constructor() {
        this.pollService = new PollService();
        this.pollValidator = new PollValidator();
    }
    async getPoll(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.pollValidator.parseId(context.params.id);
            const poll = await this.pollService.getPollById(id);
            return new ApiResponse({ data: poll });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getPollInfo(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.pollValidator.parseId(context.params.id);
            const poll = await this.pollService.getPollInfo(id);
            return new ApiResponse({ data: poll });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async searchWhoVoted(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pollId = this.pollValidator.parseId(context.params.pollId);
            const pagination = this.pollValidator.parsePagination(context.query);
            const { users, meta } = await this.pollService.searchWhoVoted(context.credentials.role, pollId, pagination);
            return new ApiResponse({ data: users, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getAnswers(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pollId = this.pollValidator.parseId(context.params.pollId);
            const userId = this.pollValidator.parseId(context.params.userId);
            const answers = await this.pollService.getAnswers(context.credentials.role, pollId, userId);
            return new ApiResponse({ data: answers });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async editAnswer(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const answerId = this.pollValidator.parseId(context.params.id);
            const answer = this.pollValidator.parsePollAnswer(context.body);
            await this.pollService.editAnswer(answerId, answer);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async saveAnswers(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pollId = this.pollValidator.parseId(context.params.id);
            const answers = this.pollValidator.parsePollAnswers(context.body);
            await this.pollService.saveAnswers(context.credentials.userId, context.credentials.role, pollId, answers);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "getPoll", null);
__decorate([
    Get('/:id/info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "getPollInfo", null);
__decorate([
    Get('/:pollId/user'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "searchWhoVoted", null);
__decorate([
    Get('/:pollId/user/:userId/answer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "getAnswers", null);
__decorate([
    Patch('/answer/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "editAnswer", null);
__decorate([
    Post('/:id/answer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "saveAnswers", null);
PollController = __decorate([
    Controller('/poll'),
    __metadata("design:paramtypes", [])
], PollController);
export { PollController };
