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
import { DealsService } from './Services/DealsService';
import { ApiResponse, Context, log } from '@core';
import CrmAsserts from './Security/CrmAsserts';
let CRMController = class CRMController {
    dealsService;
    constructor() {
        this.dealsService = new DealsService();
    }
    async onDealCreation(context) {
        try {
            CrmAsserts.hasSecret(context);
            log('Deal created');
            log(context._express.req);
            log(context.body);
            log('Deal created end');
            //const deal = await this.dealsService.create(context.body)
        }
        catch (error) {
            log('Deal creation error');
            log(error);
        }
        finally {
            return new ApiResponse(null);
        }
    }
    async onDealrefund(context) {
        try {
            CrmAsserts.hasSecret(context);
            log('Deal canceled');
            log(context._express.req);
            log(context.body);
            log('Deal canceled end');
            //const deal = await this.dealsService.create(context.body)
        }
        catch (error) {
            log('Deal cancel error');
            log(error);
        }
        finally {
            return new ApiResponse(null);
        }
    }
};
__decorate([
    Post('/deal/create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CRMController.prototype, "onDealCreation", null);
__decorate([
    Post('/deal/cancel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], CRMController.prototype, "onDealrefund", null);
CRMController = __decorate([
    Controller('/crm'),
    __metadata("design:paramtypes", [])
], CRMController);
export { CRMController };
