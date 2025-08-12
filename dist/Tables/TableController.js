var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Context } from '../Core/Request/Context.js';
import { ApiResponse } from '../Core/Response/ApiResponse.js';
import { Controller, Delete, Get, Patch, Post, } from 'express-controller-decorator';
import * as Asserts from '../Core/Security/asserts.js';
import { TableValidator } from './TableValidator.js';
import { TableService } from './Services/TableService.js';
let TableController = class TableController {
    tableService;
    tableValidator;
    constructor() {
        this.tableService = new TableService();
        this.tableValidator = new TableValidator();
    }
    async getTables(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const pagination = this.tableValidator.parsePagination(context.query);
            const { entities: tables, meta } = await this.tableService.getTables(context.credentials.userId, pagination);
            return new ApiResponse({ data: tables, meta });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async getTableById(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const tableId = this.tableValidator.parseId(context.params.id);
            const table = await this.tableService.getTable(tableId, context.credentials.userId);
            return new ApiResponse({ data: table });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async createTable(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const tableData = this.tableValidator.parseTable(context.body);
            const table = await this.tableService.createTable(tableData, context.credentials.userId);
            return new ApiResponse({ data: table });
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async updateTable(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.mentor(context);
            const tableId = this.tableValidator.parseId(context.params.id);
            const tableData = this.tableValidator.parseTable(context.body);
            await this.tableService.updateTable(tableId, tableData, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
    async deleteTable(context) {
        try {
            await Asserts.isAuthenticated(context);
            Asserts.teacher(context);
            const tableId = this.tableValidator.parseId(context.params.id);
            await this.tableService.deleteTable(tableId, context.credentials.userId);
            return new ApiResponse();
        }
        catch (error) {
            return new ApiResponse(error, context);
        }
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], TableController.prototype, "getTables", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], TableController.prototype, "getTableById", null);
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], TableController.prototype, "createTable", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], TableController.prototype, "updateTable", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], TableController.prototype, "deleteTable", null);
TableController = __decorate([
    Controller('/table'),
    __metadata("design:paramtypes", [])
], TableController);
export { TableController };
