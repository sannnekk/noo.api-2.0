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
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserModel } from '../../../Users/Data/UserModel.js';
import { VideoModel } from '../VideoModel.js';
let VideoReactionModel = class VideoReactionModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    reaction;
    user;
    video;
};
__decorate([
    Column({
        name: 'reaction',
        type: 'enum',
        enum: ['like', 'dislike', 'sad', 'happy', 'mindblowing'],
        nullable: false,
    }),
    __metadata("design:type", Object)
], VideoReactionModel.prototype, "reaction", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.videoReactions, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], VideoReactionModel.prototype, "user", void 0);
__decorate([
    ManyToOne(() => VideoModel, (video) => video.reactions, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], VideoReactionModel.prototype, "video", void 0);
VideoReactionModel = __decorate([
    Entity('video_reaction'),
    __metadata("design:paramtypes", [Object])
], VideoReactionModel);
export { VideoReactionModel };
