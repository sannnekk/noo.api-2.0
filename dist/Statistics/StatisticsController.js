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
import * as Asserts from '../Core/Security/asserts.js';
import { Context } from '../Core/Request/Context.js';
import { StatisticsService } from './Services/StatisticsService.js';
import { StatisticsValidator } from './StatisticsValidator.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
let StatisticsController = class StatisticsController {
    statisticsService;
    statisticsValidator;
    constructor() {
        this.statisticsService = new StatisticsService();
        this.statisticsValidator = new StatisticsValidator();
    }
    async getStatistics(context) {
        try {
            await Asserts.isAuthenticated(context);
            const options = this.statisticsValidator.parseGetStatistics(context.body);
            const username = this.statisticsValidator.parseSlug(context.params.username);
            const statistics = await this.statisticsService.getStatistics(username, options);
            return new ApiResponse({ data: statistics });
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
};
__decorate([
    Post('/:username'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getStatistics", null);
StatisticsController = __decorate([
    Controller('/statistics'),
    __metadata("design:paramtypes", [])
], StatisticsController);
export { StatisticsController };
