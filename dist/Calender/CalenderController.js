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
import { Controller, Get, Patch, Post, } from 'express-controller-decorator';
import { CalenderService } from './Services/CalenderService.js';
import { ApiResponse, Asserts, Context } from '../core/index.js';
let CalenderController = class CalenderController {
    calenderService;
    calenderValidator;
    constructor() {
        this.calenderService = new CalenderService();
        this.calenderValidator = new CalenderValidator();
    }
    async createCalenderEvent(context) {
        try {
            Asserts.isAuthenticated(context);
            this.calenderValidator.validateEventCreation(context.body);
            await this.calenderService.create(context.body);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getCalenderEvents(context) {
        try {
            Asserts.isAuthenticated(context);
            const pagination = this.calenderValidator.validatePagination(context.query);
            const events = await this.calenderService.get(pagination);
            const meta = await this.calenderService.getLastRequestMeta();
            return new ApiResponse({ data: events, meta });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async getCalenderEvent(context) {
        try {
            Asserts.isAuthenticated(context);
            this.calenderValidator.validateId(context.params.id);
            const event = await this.calenderService.getOne(context.params.id);
            return new ApiResponse({ data: event });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async updateCalenderEvent(context) {
        try {
            Asserts.isAuthenticated(context);
            this.calenderValidator.validateId(context.params.id);
            this.calenderValidator.validateEventCreation(context.body);
            await this.calenderService.update(context.params.id, context.body);
            return new ApiResponse(null);
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "createCalenderEvent", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "getCalenderEvents", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "getCalenderEvent", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CalenderController.prototype, "updateCalenderEvent", null);
CalenderController = __decorate([
    Controller('/calender'),
    __metadata("design:paramtypes", [])
], CalenderController);
export { CalenderController };
