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
import { DealsService } from './Services/DealsService.js';
import CrmAsserts from './Security/CrmAsserts.js';
let CRMController = class CRMController {
    dealsService;
    constructor() {
        this.dealsService = new DealsService();
    }
    async onDealCreation(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            CrmAsserts.hasSecret(context);
        }
        catch (error) {
        }
        finally {
            res.status(201).send({ data: null });
        }
    }
    async onDealrefund(req, res) {
        // @ts-ignore
        const context = req.context;
        try {
            CrmAsserts.hasSecret(context);
        }
        catch (error) {
        }
        finally {
            res.status(201).send({ data: null });
        }
    }
};
__decorate([
    Post('/deal/create'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CRMController.prototype, "onDealCreation", null);
__decorate([
    Post('/deal/cancel'),
    __param(0, Req()),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CRMController.prototype, "onDealrefund", null);
CRMController = __decorate([
    Controller('/crm'),
    __metadata("design:paramtypes", [])
], CRMController);
export { CRMController };
