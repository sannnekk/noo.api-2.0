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
import { Controller, Get, Post } from 'express-controller-decorator';
import * as Asserts from '../Core/Security/asserts.js';
import { PushSubscriptionValidator } from './PushSubscriptionValidator.js';
import { PushSubscriptionService } from './Services/PushSubscriptionService.js';
let PushSubscriptionController = class PushSubscriptionController {
    pushSubscriptionService;
    pushSubscriptionValidator;
    constructor() {
        this.pushSubscriptionValidator = new PushSubscriptionValidator();
        this.pushSubscriptionService = new PushSubscriptionService();
    }
    async getPublicKey(context) {
        try {
            const publicKey = this.pushSubscriptionService.getPublicKey();
            return new ApiResponse({ data: publicKey });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async unsubscribe(context) {
        try {
            await Asserts.isAuthenticated(context);
            const unsubscription = this.pushSubscriptionValidator.parseUnsubscription(context.body);
            await this.pushSubscriptionService.unsubscribe(context.credentials.userId, unsubscription);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async subscribe(context) {
        try {
            await Asserts.isAuthenticated(context);
            const subscription = this.pushSubscriptionValidator.parseSubscription(context.body);
            await this.pushSubscriptionService.subscribe(context.credentials.userId, subscription, context.info.userAgent || null);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
};
__decorate([
    Get('/public-key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PushSubscriptionController.prototype, "getPublicKey", null);
__decorate([
    Post('/unsubscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PushSubscriptionController.prototype, "unsubscribe", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PushSubscriptionController.prototype, "subscribe", null);
PushSubscriptionController = __decorate([
    Controller('/push-subscription'),
    __metadata("design:paramtypes", [])
], PushSubscriptionController);
export { PushSubscriptionController };
