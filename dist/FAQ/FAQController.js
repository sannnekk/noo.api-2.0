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
import * as Asserts from '../Core/Security/asserts.js';
import { FAQService } from './Services/FAQService.js';
import { Controller, Delete, Get, Patch, Post, } from 'express-controller-decorator';
import { FAQValidator } from './FAQValidator.js';
let FAQController = class FAQController {
    faqService;
    faqValidator;
    constructor() {
        this.faqService = new FAQService();
        this.faqValidator = new FAQValidator();
    }
    async getArticles(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.faqValidator.parsePagination(context.query);
            const role = context.credentials.role;
            const { entities, meta } = await this.faqService.getArticles(role, pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getArticle(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.faqValidator.parseId(context.params.id);
            const article = await this.faqService.getArticle(id, context.credentials.role);
            return new ApiResponse({ data: article });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getCategoryTree(context) {
        try {
            await Asserts.isAuthenticated(context);
            const categories = await this.faqService.getCategoryTree();
            return new ApiResponse({ data: categories });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getTreeWithArticles(context) {
        try {
            await Asserts.isAuthenticated(context);
            const categories = await this.faqService.getTreeWithArticles();
            return new ApiResponse({ data: categories });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async searchCategories(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const pagination = this.faqValidator.parsePagination(context.query);
            const { entities, meta } = await this.faqService.searchCategories(pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async createArticle(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const article = this.faqValidator.parseArticle(context.body);
            const faq = await this.faqService.createArticle(article);
            return new ApiResponse({ data: faq });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async createCategory(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const parsedCategory = this.faqValidator.parseCategory(context.body);
            const category = await this.faqService.createCategory(parsedCategory);
            return new ApiResponse({ data: category });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async updateFAQ(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.faqValidator.parseId(context.params.id);
            const article = this.faqValidator.parseArticle(context.body);
            await this.faqService.updateArticle(id, article);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async updateCategory(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.faqValidator.parseId(context.params.id);
            const category = this.faqValidator.parseCategory(context.body);
            await this.faqService.updateCategory(id, category);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteFAQ(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.faqValidator.parseId(context.params.id);
            await this.faqService.deleteArticle(id);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteCategory(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const id = this.faqValidator.parseId(context.params.id);
            await this.faqService.deleteCategory(id);
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
], FAQController.prototype, "getArticles", null);
__decorate([
    Get('/article/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "getArticle", null);
__decorate([
    Get('/category/tree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "getCategoryTree", null);
__decorate([
    Get('/category/tree/article'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "getTreeWithArticles", null);
__decorate([
    Get('/category/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "searchCategories", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "createArticle", null);
__decorate([
    Post('/category'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "createCategory", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "updateFAQ", null);
__decorate([
    Patch('/category/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "updateCategory", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "deleteFAQ", null);
__decorate([
    Delete('/category/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "deleteCategory", null);
FAQController = __decorate([
    Controller('/faq'),
    __metadata("design:paramtypes", [])
], FAQController);
export { FAQController };
