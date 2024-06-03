var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CalenderValidator } from './CalenderValidator.js';
import { Controller, Delete, Get, Post } from 'express-controller-decorator';
import { CalenderService } from './Services/CalenderService.js';
import * as Asserts from '../core/Security/asserts.js';
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
let CalenderController = class CalenderController {
    calenderService;
    calenderValidator;
    constructor() {
        this.calenderService = new CalenderService();
        this.calenderValidator = new CalenderValidator();
    }
    async createCalenderEvent(context) {
        try {
            await Asserts.isAuthenticated(context);
            const eventCreationOptions = this.calenderValidator.parseEventCreation(context.body);
            const calenderEvent = await this.calenderService.create(eventCreationOptions, context.credentials.username);
            return new ApiResponse({ data: calenderEvent });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getCalenderEvents(context) {
        try {
            await Asserts.isAuthenticated(context);
            const pagination = this.calenderValidator.parsePagination(context.query);
            const { events, meta } = await this.calenderService.get(context.credentials.username, pagination);
            return new ApiResponse({ data: events, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async deleteCalenderEvent(context) {
        try {
            await Asserts.isAuthenticated(context);
            const eventId = this.calenderValidator.parseId(context.params.id);
            await this.calenderService.delete(eventId, context.credentials.username);
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
], CalenderController.prototype, "createCalenderEvent", null);
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "getCalenderEvents", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "deleteCalenderEvent", null);
CalenderController = __decorate([
    Controller('/calender'),
    __metadata("design:paramtypes", [])
], CalenderController);
export { CalenderController };
