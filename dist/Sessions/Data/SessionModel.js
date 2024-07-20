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
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { UserModel } from '../../Users/Data/UserModel.js';
let SessionModel = class SessionModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    userAgent;
    isMobile;
    browser;
    os;
    device;
    ipAddress;
    lastRequestAt;
    user;
    userId;
};
__decorate([
    Column({
        name: 'user_agent',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], SessionModel.prototype, "userAgent", void 0);
__decorate([
    Column({
        name: 'is_mobile',
        type: 'boolean',
    }),
    __metadata("design:type", Boolean)
], SessionModel.prototype, "isMobile", void 0);
__decorate([
    Column({
        name: 'browser',
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", Object)
], SessionModel.prototype, "browser", void 0);
__decorate([
    Column({
        name: 'os',
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", Object)
], SessionModel.prototype, "os", void 0);
__decorate([
    Column({
        name: 'device',
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", Object)
], SessionModel.prototype, "device", void 0);
__decorate([
    Column({
        name: 'ip_address',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], SessionModel.prototype, "ipAddress", void 0);
__decorate([
    Column({
        name: 'last_request_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], SessionModel.prototype, "lastRequestAt", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.sessions),
    __metadata("design:type", Object)
], SessionModel.prototype, "user", void 0);
__decorate([
    RelationId((session) => session.user),
    __metadata("design:type", String)
], SessionModel.prototype, "userId", void 0);
SessionModel = __decorate([
    Entity('session'),
    __metadata("design:paramtypes", [Object])
], SessionModel);
export { SessionModel };
