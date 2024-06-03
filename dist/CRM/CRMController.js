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
import { DealsService } from './Services/DealsService.js';
import { Context } from '../Core/Request/Context.js';
import CrmAsserts from './Security/CrmAsserts.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
let CRMController = class CRMController {
    dealsService;
    constructor() {
        this.dealsService = new DealsService();
    }
    async onDealCreation(context) {
        try {
            CrmAsserts.hasSecret(context);
            await this.dealsService.create('mock', 'abracadabra');
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
        }
    }
    async onDealrefund(context) {
        try {
            CrmAsserts.hasSecret(context);
            await this.dealsService.remove('mock');
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error);
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
