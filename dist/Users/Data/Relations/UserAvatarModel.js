var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../../Core/Data/Model.js';
import { MediaModel } from '../../../Media/Data/MediaModel.js';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserModel } from '../UserModel.js';
let UserAvatarModel = class UserAvatarModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.media) {
                this.media = new MediaModel(data.media);
            }
        }
    }
    media;
    user;
    avatarType;
    telegramAvatarUrl;
};
__decorate([
    OneToOne(() => MediaModel, (media) => media.avatar, {
        eager: true,
        onDelete: 'CASCADE',
        cascade: true,
    }),
    JoinColumn(),
    __metadata("design:type", Object)
], UserAvatarModel.prototype, "media", void 0);
__decorate([
    OneToOne(() => UserModel, (user) => user.avatar),
    __metadata("design:type", Object)
], UserAvatarModel.prototype, "user", void 0);
__decorate([
    Column({
        name: 'avatar_type',
        type: 'enum',
        enum: ['telegram', 'custom'],
        default: 'custom',
    }),
    __metadata("design:type", Object)
], UserAvatarModel.prototype, "avatarType", void 0);
__decorate([
    Column({
        name: 'telegram_avatar_url',
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", String)
], UserAvatarModel.prototype, "telegramAvatarUrl", void 0);
UserAvatarModel = __decorate([
    Entity('user_avatar'),
    __metadata("design:paramtypes", [Object])
], UserAvatarModel);
export { UserAvatarModel };
