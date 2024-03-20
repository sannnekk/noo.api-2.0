var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Post, Req, Res } from '@decorators/express';
import { MediaService } from './Services/MediaService.js';
import * as Asserts from '../Core/Security/asserts.js';
import { MediaMiddleware } from '../Core/Request/MediaMiddleware.js';
import { getErrorData } from '../Core/Response/helpers.js';
let MediaController = class MediaController {
    mediaService;
    constructor() {
        this.mediaService = new MediaService();
    }
    async get(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            const links = await this.mediaService.upload(context.files);
            res.status(201).send({ data: links });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
};
__decorate([
    Post('/', [MediaMiddleware]),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "get", null);
MediaController = __decorate([
    Controller('/media'),
    __metadata("design:paramtypes", [])
], MediaController);
export { MediaController };
