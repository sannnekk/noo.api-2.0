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
import { VideoService } from './Services/VideoService.js';
import { VideoValidator } from './VideoValidator.js';
import { VideoCommentService } from './Services/VideoCommentService.js';
let VideoController = class VideoController {
    videoService;
    videoCommentService;
    videoValidator;
    constructor() {
        this.videoService = new VideoService();
        this.videoCommentService = new VideoCommentService();
        this.videoValidator = new VideoValidator();
    }
    async getVideos(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.videoValidator.parsePagination(context.query);
            const { entities, total, relations } = await this.videoService.getVideos(pagination, context.credentials.userId, context.credentials.role);
            return new ApiResponse({ data: entities, meta: { total, relations } });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getVideo(context) {
        try {
            await Asserts.isAuthenticated(context);
            const videoId = this.videoValidator.parseId(context.params.id);
            const video = await this.videoService.getVideo(videoId, context.credentials.userId, context.credentials.role);
            return new ApiResponse({ data: video });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async createVideo(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const video = this.videoValidator.parseVideo(context.body);
            const { id, uploadUrl } = await this.videoService.createVideo(video, context.credentials.userId, context.credentials.role);
            return new ApiResponse({ data: { uploadUrl, id } });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async finishUpload(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const videoId = this.videoValidator.parseId(context.params.id);
            await this.videoService.finishUpload(videoId, context.credentials.userId, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async publishVideo(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const videoId = this.videoValidator.parseId(context.params.id);
            await this.videoService.publishVideo(videoId, context.credentials.userId, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async updateVideo(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const videoId = this.videoValidator.parseId(context.params.id);
            const video = this.videoValidator.parseVideo(context.body);
            await this.videoService.updateVideo(videoId, video, context.credentials.userId, context.credentials.role);
            return new ApiResponse({ data: video });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getComments(context) {
        try {
            await Asserts.isAuthenticated(context);
            const videoId = this.videoValidator.parseId(context.params.videoId);
            const pagination = this.videoValidator.parsePagination(context.query);
            const { entities: comments, meta } = await this.videoCommentService.getComments(videoId, context.credentials.userId, context.credentials.role, pagination);
            return new ApiResponse({ data: comments, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async addComment(context) {
        try {
            await Asserts.isAuthenticated(context);
            const videoId = this.videoValidator.parseId(context.params.videoId);
            const comment = this.videoValidator.parseComment(context.body);
            await this.videoCommentService.addComment(videoId, context.credentials.userId, context.credentials.role, comment);
            return new ApiResponse({ data: comment });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async updateComment(context) {
        try {
            await Asserts.isAuthenticated(context);
            const commentId = this.videoValidator.parseId(context.params.commentId);
            const comment = this.videoValidator.parseComment(context.body);
            await this.videoCommentService.updateComment(context.credentials.userId, commentId, comment);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteComment(context) {
        try {
            await Asserts.isAuthenticated(context);
            const commentId = this.videoValidator.parseId(context.params.commentId);
            await this.videoCommentService.deleteComment(commentId, context.credentials.userId, context.credentials.role);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteVideo(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            const videoId = this.videoValidator.parseId(context.params.id);
            await this.videoService.deleteVideo(videoId, context.credentials.userId, context.credentials.role);
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
], VideoController.prototype, "getVideos", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "getVideo", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "createVideo", null);
__decorate([
    Post('/:id/finish-upload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "finishUpload", null);
__decorate([
    Post('/:id/publish'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "publishVideo", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "updateVideo", null);
__decorate([
    Get('/:videoId/comment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "getComments", null);
__decorate([
    Post('/:videoId/comment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "addComment", null);
__decorate([
    Patch('/comment/:commentId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "updateComment", null);
__decorate([
    Delete('/comment/:commentId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "deleteComment", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "deleteVideo", null);
VideoController = __decorate([
    Controller('/video'),
    __metadata("design:paramtypes", [])
], VideoController);
export { VideoController };
