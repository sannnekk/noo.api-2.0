var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BlogValidator } from './BlogValidator.js';
import { Controller, Get, Post, Patch, Delete, } from 'express-controller-decorator';
import { BlogService } from './Services/BlogService.js';
import * as Asserts from '../core/Security/asserts.js';
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
let BlogController = class BlogController {
    blogService;
    blogValidator;
    constructor() {
        this.blogService = new BlogService();
        this.blogValidator = new BlogValidator();
    }
    async getPosts(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.blogValidator.parsePagination(context.query);
            const { posts, meta } = await this.blogService.getAll(pagination, context.credentials.userId);
            return new ApiResponse({
                data: posts,
                meta,
            });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getPost(context) {
        try {
            await Asserts.isAuthenticated(context);
            const blogId = this.blogValidator.parseId(context.params.id);
            const post = await this.blogService.getById(blogId, context.credentials.userId);
            return new ApiResponse({ data: post });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async reactToPost(context) {
        try {
            await Asserts.isAuthenticated(context);
            const postId = this.blogValidator.parseId(context.params.id);
            const reaction = this.blogValidator.parseReaction(context.params.reaction);
            const newCounts = await this.blogService.toggleReaction(postId, context.credentials.userId, reaction);
            return new ApiResponse({ data: newCounts });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async createPost(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const post = this.blogValidator.parseCreateBlog(context.body);
            const createdPost = await this.blogService.create(post, context.credentials.userId);
            return new ApiResponse({ data: createdPost });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async updatePost(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            this.blogValidator.parseId(context.params.id);
            const post = this.blogValidator.parseUpdateBlog(context.body);
            await this.blogService.update(post);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async deletePost(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const postId = this.blogValidator.parseId(context.params.id);
            await this.blogService.delete(postId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "getPosts", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "getPost", null);
__decorate([
    Patch('/:id/react/:reaction'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "reactToPost", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "createPost", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "updatePost", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "deletePost", null);
BlogController = __decorate([
    Controller('/blog'),
    __metadata("design:paramtypes", [])
], BlogController);
export { BlogController };
