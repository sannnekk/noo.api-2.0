var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, ControllerResponse, Delete, Post, } from 'express-controller-decorator';
import { MediaService } from './Services/MediaService.js';
import { StatusCodes } from 'http-status-codes';
import { Asserts, Context } from '../core/index.js';
let MediaController = class MediaController {
    mediaService;
    constructor() {
        this.mediaService = new MediaService();
    }
    async get(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            const links = await this.mediaService.upload(context._express.req.files);
            return new ControllerResponse({ links }, StatusCodes.OK);
        }
        catch (e) {
            return new ControllerResponse(null, e.code || StatusCodes.BAD_REQUEST);
        }
    }
    async delete(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            await this.mediaService.remove(context.query.src);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (e) {
            return new ControllerResponse(null, e.code || StatusCodes.BAD_REQUEST);
        }
    }
};
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "get", null);
__decorate([
    Delete(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "delete", null);
MediaController = __decorate([
    Controller('/media'),
    __metadata("design:paramtypes", [])
], MediaController);
export { MediaController };
