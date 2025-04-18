var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity } from 'typeorm';
import { SearchableModel } from '../../Core/Data/SearchableModel.js';
import { config } from '../../config.js';
let GoogleSheetsBindingModel = class GoogleSheetsBindingModel extends SearchableModel {
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
    googleRefreshToken;
    googleCredentials;
    lastRunAt;
    status;
    lastErrorText;
    frequency;
    addSearchToQuery(query, needle) {
        query.andWhere('LOWER(google_sheets_binding.name) LIKE LOWER(:needle)', {
            needle: `%${needle}%`,
        });
        return [];
    }
};
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], GoogleSheetsBindingModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'entity_name',
        type: 'varchar',
        length: 255,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], GoogleSheetsBindingModel.prototype, "entityName", void 0);
__decorate([
    Column({
        name: 'entity_selector',
        type: 'json',
    }),
    __metadata("design:type", Object)
], GoogleSheetsBindingModel.prototype, "entitySelector", void 0);
__decorate([
    Column({
        name: 'file_path',
        type: 'simple-array',
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Array)
], GoogleSheetsBindingModel.prototype, "filePath", void 0);
__decorate([
    Column({
        name: 'google_oauth_token',
        type: 'text',
        nullable: true,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], GoogleSheetsBindingModel.prototype, "googleOAuthToken", void 0);
__decorate([
    Column({
        name: 'google_refresh_token',
        type: 'text',
        nullable: true,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Object)
], GoogleSheetsBindingModel.prototype, "googleRefreshToken", void 0);
__decorate([
    Column({
        name: 'google_credentials',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], GoogleSheetsBindingModel.prototype, "googleCredentials", void 0);
__decorate([
    Column({
        name: 'last_run_at',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Object)
], GoogleSheetsBindingModel.prototype, "lastRunAt", void 0);
__decorate([
    Column({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive', 'error'],
        default: 'active',
    }),
    __metadata("design:type", String)
], GoogleSheetsBindingModel.prototype, "status", void 0);
__decorate([
    Column({
        name: 'last_error_text',
        type: 'text',
        nullable: true,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Object)
], GoogleSheetsBindingModel.prototype, "lastErrorText", void 0);
__decorate([
    Column({
        name: 'frequency',
        type: 'enum',
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
        default: 'daily',
    }),
    __metadata("design:type", String)
], GoogleSheetsBindingModel.prototype, "frequency", void 0);
GoogleSheetsBindingModel = __decorate([
    Entity('google_sheets_binding'),
    __metadata("design:paramtypes", [Object])
], GoogleSheetsBindingModel);
export { GoogleSheetsBindingModel };
