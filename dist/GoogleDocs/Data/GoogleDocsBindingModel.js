var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../Core/Data/Model.js';
import { Column, Entity } from 'typeorm';
let GoogleDocsBindingModel = class GoogleDocsBindingModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    name;
    entityName;
    entitySelector;
    filePath;
    googleOAuthToken;
    googleCredentials;
    status;
    format;
    frequency;
    static entriesToSearch() {
        return ['name', 'entityName', 'filePath'];
    }
};
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", String)
], GoogleDocsBindingModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'entity_name',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", String)
], GoogleDocsBindingModel.prototype, "entityName", void 0);
__decorate([
    Column({
        name: 'entity_selector',
        type: 'json',
    }),
    __metadata("design:type", Object)
], GoogleDocsBindingModel.prototype, "entitySelector", void 0);
__decorate([
    Column({
        name: 'file_path',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", String)
], GoogleDocsBindingModel.prototype, "filePath", void 0);
__decorate([
    Column({
        name: 'google_oauth_token',
        type: 'text',
    }),
    __metadata("design:type", String)
], GoogleDocsBindingModel.prototype, "googleOAuthToken", void 0);
__decorate([
    Column({
        name: 'google_credentials',
        type: 'json',
    }),
    __metadata("design:type", Object)
], GoogleDocsBindingModel.prototype, "googleCredentials", void 0);
__decorate([
    Column({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive', 'error'],
        default: 'active',
    }),
    __metadata("design:type", String)
], GoogleDocsBindingModel.prototype, "status", void 0);
__decorate([
    Column({
        name: 'format',
        type: 'enum',
        enum: ['csv'],
        default: 'csv',
    }),
    __metadata("design:type", String)
], GoogleDocsBindingModel.prototype, "format", void 0);
__decorate([
    Column({
        name: 'frequency',
        type: 'enum',
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
        default: 'daily',
    }),
    __metadata("design:type", String)
], GoogleDocsBindingModel.prototype, "frequency", void 0);
GoogleDocsBindingModel = __decorate([
    Entity('google_docs_binding'),
    __metadata("design:paramtypes", [Object])
], GoogleDocsBindingModel);
export { GoogleDocsBindingModel };
