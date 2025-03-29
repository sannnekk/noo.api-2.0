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
import { Entity, ManyToOne } from 'typeorm';
import { VideoModel } from '../VideoModel.js';
import { UserModel } from '../../../Users/Data/UserModel.js';
let VideoSavingModel = class VideoSavingModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    video;
    user;
};
__decorate([
    ManyToOne(() => VideoModel, (video) => video.savings, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    __metadata("design:type", Object)
], VideoSavingModel.prototype, "video", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.savedVideos, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    __metadata("design:type", Object)
], VideoSavingModel.prototype, "user", void 0);
VideoSavingModel = __decorate([
    Entity('video_saving'),
    __metadata("design:paramtypes", [Object])
], VideoSavingModel);
export { VideoSavingModel };
