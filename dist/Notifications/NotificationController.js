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
import { NotificationValidator } from './NotificationValidator.js';
import { NotificationService } from './Services/NotificationService.js';
let NotificationsController = class NotificationsController {
    notificationService;
    notificationValidator;
    constructor() {
        this.notificationValidator = new NotificationValidator();
        this.notificationService = new NotificationService();
    }
    async getAll(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.notificationValidator.parsePagination(context.query);
            const { entities, meta } = await this.notificationService.getRead(context.credentials.userId, pagination);
            return new ApiResponse({ data: entities, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getUnread(context) {
        try {
            await Asserts.isAuthenticated(context);
            const count = await this.notificationService.getUnread(context.credentials.userId);
            return new ApiResponse({ data: count });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getUnreadCount(context) {
        try {
            await Asserts.isAuthenticated(context);
            const count = await this.notificationService.getUnreadCount(context.credentials.userId);
            return new ApiResponse({ data: count });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async markAllAsRead(context) {
        try {
            await Asserts.isAuthenticated(context);
            await this.notificationService.markAllAsRead(context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async create(context) {
        try {
            await Asserts.isAuthenticated(context);
            const notificationCreationDTO = this.notificationValidator.parseNotificationCreation(context.body);
            await this.notificationService.create(notificationCreationDTO.notification, notificationCreationDTO.sendOptions);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async delete(context) {
        try {
            await Asserts.isAuthenticated(context);
            const id = this.notificationValidator.parseId(context.params.id);
            const userId = context.credentials.userId;
            await this.notificationService.delete(id, userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
};
__decorate([
    Get('/read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAll", null);
__decorate([
    Get('/unread'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnread", null);
__decorate([
    Get('/unread-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    Patch('/mark-all-as-read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "create", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "delete", null);
NotificationsController = __decorate([
    Controller('/notification'),
    __metadata("design:paramtypes", [])
], NotificationsController);
export { NotificationsController };
