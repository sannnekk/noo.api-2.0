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
import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { MediaModel } from '../../Media/Data/MediaModel.js';
import { UserModel } from '../../Users/Data/UserModel.js';
let UserSettingsModel = class UserSettingsModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.backgroundImage) {
                this.backgroundImage = new MediaModel(data.backgroundImage);
            }
        }
    }
    user;
    backgroundImage;
};
__decorate([
    OneToOne(() => UserModel, (user) => user.settings),
    JoinColumn(),
    __metadata("design:type", Object)
], UserSettingsModel.prototype, "user", void 0);
__decorate([
    OneToOne(() => MediaModel, (media) => media.userSettings, {
        cascade: true,
        eager: true,
    }),
    JoinColumn(),
    __metadata("design:type", Object)
], UserSettingsModel.prototype, "backgroundImage", void 0);
UserSettingsModel = __decorate([
    Entity('user_settings'),
    __metadata("design:paramtypes", [Object])
], UserSettingsModel);
export { UserSettingsModel };
