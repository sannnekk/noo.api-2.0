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
import { UserModel } from '../../Users/Data/UserModel.js';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
let PushSubscriptionModel = class PushSubscriptionModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    user;
    userId;
    endpoint;
    p256dh;
    auth;
    userAgent;
};
__decorate([
    ManyToOne(() => UserModel, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], PushSubscriptionModel.prototype, "user", void 0);
__decorate([
    RelationId((subscription) => subscription.user),
    __metadata("design:type", String)
], PushSubscriptionModel.prototype, "userId", void 0);
__decorate([
    Column({
        name: 'endpoint',
        type: 'varchar',
        length: 512,
        unique: true,
    }),
    __metadata("design:type", String)
], PushSubscriptionModel.prototype, "endpoint", void 0);
__decorate([
    Column({
        name: 'p256dh',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], PushSubscriptionModel.prototype, "p256dh", void 0);
__decorate([
    Column({
        name: 'auth',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], PushSubscriptionModel.prototype, "auth", void 0);
__decorate([
    Column({
        name: 'user_agent',
        type: 'varchar',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], PushSubscriptionModel.prototype, "userAgent", void 0);
PushSubscriptionModel = __decorate([
    Entity('push_subscription'),
    __metadata("design:paramtypes", [Object])
], PushSubscriptionModel);
export { PushSubscriptionModel };
