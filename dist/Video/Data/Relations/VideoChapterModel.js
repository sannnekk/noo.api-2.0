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
import { VideoModel } from '../VideoModel.js';
let VideoChapterModel = class VideoChapterModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    title;
    description;
    timestamp;
    video;
};
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", String)
], VideoChapterModel.prototype, "title", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], VideoChapterModel.prototype, "description", void 0);
__decorate([
    Column({
        name: 'timestamp',
        type: 'int',
    }),
    __metadata("design:type", Number)
], VideoChapterModel.prototype, "timestamp", void 0);
__decorate([
    ManyToOne(() => VideoModel, (video) => video.chapters),
    __metadata("design:type", Object)
], VideoChapterModel.prototype, "video", void 0);
VideoChapterModel = __decorate([
    Entity('video_chapter'),
    __metadata("design:paramtypes", [Object])
], VideoChapterModel);
export { VideoChapterModel };
