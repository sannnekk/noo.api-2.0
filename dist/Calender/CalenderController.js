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
import { CalenderValidator } from './CalenderValidator.js';
import { Controller, Delete, Get, Post, Res, Req, } from '@decorators/express';
import { CalenderService } from './Services/CalenderService.js';
import { Asserts } from '../core/index.js';
import { getErrorData } from '../Core/Response/helpers.js';
let CalenderController = class CalenderController {
    calenderService;
    calenderValidator;
    constructor() {
        this.calenderService = new CalenderService();
        this.calenderValidator = new CalenderValidator();
    }
    async createCalenderEvent(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            this.calenderValidator.validateEventCreation(context.body);
            await this.calenderService.create(context.body, context.credentials.username);
            res.status(201).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async getCalenderEvents(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            Asserts.isAuthenticated(context);
            const pagination = this.calenderValidator.validatePagination(context.query);
            const events = await this.calenderService.get(context.credentials.username, pagination);
            const meta = await this.calenderService.getLastRequestMeta();
            res.status(200).send({ data: events, meta });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
    async deleteCalenderEvent(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            this.calenderValidator.validateId(context.params.id);
            await this.calenderService.delete(context.params.id, context.credentials.username);
            res.status(200).send({ data: null });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
};
__decorate([
    Post('/'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "createCalenderEvent", null);
__decorate([
    Get('/'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "getCalenderEvents", null);
__decorate([
    Delete('/:id'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "deleteCalenderEvent", null);
CalenderController = __decorate([
    Controller('/calender'),
    __metadata("design:paramtypes", [])
], CalenderController);
export { CalenderController };
