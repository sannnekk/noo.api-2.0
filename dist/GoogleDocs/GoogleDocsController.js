var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Post } from 'express-controller-decorator';
import { GoogleSheetsService } from './Services/GoogleSheetsService.js';
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { GoogleDocsValidator } from './GoogleDocsValidator.js';
import * as Asserts from '../Core/Security/asserts.js';
let TelegramController = class TelegramController {
    googleSheetsService;
    googleDocsValidator;
    constructor() {
        this.googleSheetsService = new GoogleSheetsService();
        this.googleDocsValidator = new GoogleDocsValidator();
    }
    async bindTelegram(context) {
        try {
            await Asserts.isAuthenticated(context);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "bindTelegram", null);
TelegramController = __decorate([
    Controller('/telegram'),
    __metadata("design:paramtypes", [])
], TelegramController);
export { TelegramController };
