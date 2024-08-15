var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { generate } from './Ulid.js';
import { config } from '../../config.js';
export class Model {
    set(data) {
        Object.assign(this, data);
    }
    id = generate();
    createdAt;
    updatedAt;
    toJSON() {
        const jsonObj = { ...this };
        const proto = Object.getPrototypeOf(this);
        for (const key of Object.getOwnPropertyNames(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key);
            if (desc && typeof desc.get === 'function') {
                const value = desc.get.call(this);
                if (value !== undefined) {
                    jsonObj[key] = value;
                }
            }
        }
        return { ...jsonObj, password: undefined };
    }
}
__decorate([
    PrimaryColumn({
        name: 'id',
        type: 'varchar',
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], Model.prototype, "id", void 0);
__decorate([
    CreateDateColumn({
        type: 'timestamp',
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP(6)',
    }),
    __metadata("design:type", Date)
], Model.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    }),
    __metadata("design:type", Date)
], Model.prototype, "updatedAt", void 0);
