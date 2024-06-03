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
import { MediaService } from './Services/MediaService.js';
import * as Asserts from '../Core/Security/asserts.js';
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { NoFilesProvidedError } from '../core/Errors/NoFilesProvidedError.js';
let MediaController = class MediaController {
    mediaService;
    constructor() {
        this.mediaService = new MediaService();
    }
    async get(context) {
        try {
            await Asserts.isAuthenticated(context);
            const requestFiles = await context.getFiles();
            if (!requestFiles?.length) {
                throw new NoFilesProvidedError();
            }
            const mediaFiles = await this.mediaService.upload(requestFiles);
            return new ApiResponse({ data: mediaFiles });
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
], MediaController.prototype, "get", null);
MediaController = __decorate([
    Controller('/media'),
    __metadata("design:paramtypes", [])
], MediaController);
export { MediaController };
