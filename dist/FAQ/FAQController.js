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
    async getFAQ(context) {
        try {
            await Asserts.isAuthenticated(context);
            const role = context.credentials.role;
            const faq = await this.faqService.getFAQ(role);
            return new ApiResponse({ data: faq });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async createFAQ(context) {
        try {
            await Asserts.teacherOrAdmin(context);
            const article = this.faqValidator.parseArticle(context.body);
            const faq = await this.faqService.createArticle(article);
            return new ApiResponse({ data: faq });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async updateFAQ(context) {
        try {
            await Asserts.teacherOrAdmin(context);
            const id = this.faqValidator.parseId(context.params.id);
            const article = this.faqValidator.parseArticle(context.body);
            await this.faqService.updateArticle(id, article);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async deleteFAQ(context) {
        try {
            await Asserts.teacherOrAdmin(context);
            const id = this.faqValidator.parseId(context.params.id);
            await this.faqService.deleteArticle(id);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "getFAQ", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "createFAQ", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "updateFAQ", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "deleteFAQ", null);
FAQController = __decorate([
    Controller('/faq'),
    __metadata("design:paramtypes", [])
], FAQController);
export { FAQController };
