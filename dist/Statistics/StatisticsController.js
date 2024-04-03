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
import * as Asserts from '../Core/Security/asserts.js';
import { getErrorData } from '../core/Response/helpers.js';
import { StatisticsService } from './Services/StatisticsService.js';
import { StatisticsValidator } from './StatisticsValidator.js';
let StatisticsController = class StatisticsController {
    statisticsService;
    statisticsValidator;
    constructor() {
        this.statisticsService = new StatisticsService();
        this.statisticsValidator = new StatisticsValidator();
    }
    async getStatistics(req, res) {
        // @ts-ignore
        const context = req.context;
        context.setParams(req.params);
        try {
            Asserts.isAuthenticated(context);
            this.statisticsValidator.validateGetStatistics(context.body);
            this.statisticsValidator.validateSlug(context.params.username);
            const statistics = await this.statisticsService.getStatistics(context.params.username, context.body.from, context.body.to, context.body.type);
            res.status(200).send({ data: statistics });
        }
        catch (error) {
            const { status, message } = getErrorData(error);
            res.status(status).send({ error: message });
        }
    }
};
__decorate([
    Post('/:username'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getStatistics", null);
StatisticsController = __decorate([
    Controller('/statistics'),
    __metadata("design:paramtypes", [])
], StatisticsController);
export { StatisticsController };
