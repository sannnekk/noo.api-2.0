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
let NotificationModel = class NotificationModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (!data.status) {
                this.status = 'unread';
            }
            if (data.user) {
                this.user = new UserModel(data.user);
            }
        }
    }
    user;
    userId;
    title;
    message;
    link;
    status;
    type;
    isBanner;
};
__decorate([
    ManyToOne(() => UserModel, (user) => user.notifications, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], NotificationModel.prototype, "user", void 0);
__decorate([
    RelationId((notification) => notification.user),
    __metadata("design:type", String)
], NotificationModel.prototype, "userId", void 0);
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
        nullable: false,
    }),
    __metadata("design:type", String)
], NotificationModel.prototype, "title", void 0);
__decorate([
    Column({
        name: 'message',
        type: 'text',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], NotificationModel.prototype, "message", void 0);
__decorate([
    Column({
        name: 'link',
        type: 'varchar',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], NotificationModel.prototype, "link", void 0);
__decorate([
    Column({
        name: 'status',
        type: 'enum',
        enum: ['read', 'unread'],
        default: 'unread',
    }),
    __metadata("design:type", String)
], NotificationModel.prototype, "status", void 0);
__decorate([
    Column({
        name: 'type',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], NotificationModel.prototype, "type", void 0);
__decorate([
    Column({
        name: 'is_banner',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], NotificationModel.prototype, "isBanner", void 0);
NotificationModel = __decorate([
    Entity('notification'),
    __metadata("design:paramtypes", [Object])
], NotificationModel);
export { NotificationModel };
