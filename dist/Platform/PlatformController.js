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
import { Controller, Get } from 'express-controller-decorator';
import * as Asserts from '../Core/Security/asserts.js';
import { PlatformService } from './Services/PlatformService.js';
import { PlatformValidator } from './PlatformValidator.js';
let PlatformController = class PlatformController {
    platformService;
    platformValidator;
    constructor() {
        this.platformService = new PlatformService();
        this.platformValidator = new PlatformValidator();
    }
    async version(context) {
        try {
            await Asserts.isAuthenticated(context);
            const result = await this.platformService.version();
            return new ApiResponse({ data: result });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async changelog(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const changelog = await this.platformService.changelog();
            return new ApiResponse({ data: changelog });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async changelogOfVersion(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const version = this.platformValidator.parseVersion(context.params.version);
            const changelog = await this.platformService.changelogForVersion(version);
            return new ApiResponse({ data: changelog });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async healthcheck(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const result = await this.platformService.healthcheck();
            return new ApiResponse({ data: result });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async heapdump(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const heapdumpFilePath = await this.platformService.heapdump();
            return new ApiResponse({
                data: {
                    path: heapdumpFilePath,
                },
            });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Get('/version'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "version", null);
__decorate([
    Get('/changelog'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "changelog", null);
__decorate([
    Get('/changelog/:version'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "changelogOfVersion", null);
__decorate([
    Get('/healthcheck'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "healthcheck", null);
__decorate([
    Get('/heapdump'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "heapdump", null);
PlatformController = __decorate([
    Controller('/platform'),
    __metadata("design:paramtypes", [])
], PlatformController);
export { PlatformController };
