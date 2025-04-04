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
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import * as Asserts from '../Core/Security/asserts.js';
import { PollService } from './Services/PollService.js';
import { PollValidator } from './PollValidator.js';
let PollController = class PollController {
    pollService;
    pollValidator;
    constructor() {
        this.pollService = new PollService();
        this.pollValidator = new PollValidator();
    }
    async getPolls(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const pagination = this.pollValidator.parsePagination(context.query);
            const { entities, meta } = await this.pollService.getPolls(pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getMyPolls(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentorOrStudent(context);
            const pagination = this.pollValidator.parsePagination(context.query);
            const { entities, meta } = await this.pollService.getMyPolls(context.credentials.userId, pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getQuestions(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const pagination = this.pollValidator.parsePagination(context.query);
            const { entities, meta } = await this.pollService.searchQuestions(pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getPoll(context) {
        try {
            //await Asserts.isAuthenticated(context)
            const id = this.pollValidator.parseId(context.params.id);
            const poll = await this.pollService.getPollById(id, context.credentials?.userId);
            return new ApiResponse({ data: poll });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async createPoll(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const poll = this.pollValidator.parsePoll(context.body);
            const createdPoll = await this.pollService.createPoll(poll);
            return new ApiResponse({ data: createdPoll });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async editPoll(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.pollValidator.parseId(context.params.id);
            const poll = this.pollValidator.parsePoll(context.body);
            await this.pollService.updatePoll(id, poll);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
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
            return new ApiResponse(error, context);
        }
    }
    async searchWhoVoted(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pollId = this.pollValidator.parseId(context.params.pollId);
            const pagination = this.pollValidator.parsePagination(context.query);
            const { entities, meta } = await this.pollService.searchWhoVoted(context.credentials.role, pollId, pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async searchWhoVotedUnregistered(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pollId = this.pollValidator.parseId(context.params.pollId);
            const pagination = this.pollValidator.parsePagination(context.query);
            const { entities, meta } = await this.pollService.searchWhoVotedUnregistered(context.credentials.role, pollId, pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getAnswers(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pollId = this.pollValidator.parseId(context.params.pollId);
            const userIdOrTelegramUsername = this.pollValidator.parseIdOrTelegramUsername(context.params.userId);
            const answers = await this.pollService.getAnswers(context.credentials.userId, context.credentials.role, pollId, userIdOrTelegramUsername);
            return new ApiResponse({ data: answers });
        }
        catch (error) {
            return new ApiResponse(error, context);
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
            return new ApiResponse(error, context);
        }
    }
    async saveAnswers(context) {
        try {
            //await Asserts.isAuthenticated(context)
            const pollId = this.pollValidator.parseId(context.params.id);
            const answers = this.pollValidator.parsePollAnswers(context.body);
            await this.pollService.saveAnswers(context.credentials?.userId, context.credentials?.role, pollId, answers);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deletePoll(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.pollValidator.parseId(context.params.id);
            await this.pollService.deletePoll(id);
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
], PollController.prototype, "getPolls", null);
__decorate([
    Get('/my'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "getMyPolls", null);
__decorate([
    Get('/question'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "getQuestions", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "getPoll", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "createPoll", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "editPoll", null);
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
    Get('/:pollId/unregistered'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "searchWhoVotedUnregistered", null);
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
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PollController.prototype, "deletePoll", null);
PollController = __decorate([
    Controller('/poll'),
    __metadata("design:paramtypes", [])
], PollController);
export { PollController };
