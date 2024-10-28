var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get, Patch } from 'express-controller-decorator';
import { UserSettingsService } from './Services/UserSettingsService.js';
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import * as Asserts from '../Core/Security/asserts.js';
import { UserSettingsValidator } from './UserSettingsValidator.js';
let UserController = class UserController {
    userSettingsService;
    settingsValidator;
    constructor() {
        this.userSettingsService = new UserSettingsService();
        this.settingsValidator = new UserSettingsValidator();
    }
    async get(context) {
        try {
            await Asserts.isAuthenticated(context);
            const userSettings = await this.userSettingsService.getSettings(context.credentials.userId);
            return new ApiResponse({ data: userSettings });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async update(context) {
        try {
            await Asserts.isAuthenticated(context);
            const settings = this.settingsValidator.parseSettings(context.body);
            const userSettings = await this.userSettingsService.updateSettings(context.credentials.userId, settings);
            return new ApiResponse({ data: userSettings });
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
], UserController.prototype, "get", null);
__decorate([
    Patch(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
UserController = __decorate([
    Controller('/user-settings'),
    __metadata("design:paramtypes", [])
], UserController);
export { UserController };
